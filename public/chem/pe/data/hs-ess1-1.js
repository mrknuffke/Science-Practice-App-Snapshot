/**
 * HS-ESS1-1: Solar Fusion & Lifespan of the Sun
 * Items rewritten (Oct 2026) to the Tier 3 register in docs/textbook/VOICE.md and to the core scope
 * of lesson 5-1a: inward gravity balanced by outward pressure from fusion in the core; hydrogen fusing
 * into helium in the core (without requiring the proton-proton chain steps, positrons, neutrinos, or
 * weak-force transmutation, which are Enrichment in 5-1a); how energy travels from the core to Earth;
 * why more massive stars burn much brighter and live shorter lives; and the Sun's red-giant / white-dwarf end.
 * Zero em-dash compliant: hyphens, colons, and parentheses only.
 */
(function() {
  'use strict';

  const PE_INFO = {
    id: 'HS-ESS1-1',
    code: 'ESS1-1',
    title: 'Solar Fusion & Lifespan of the Sun',
    unit: 'Unit 5: Nuclear & Astrophysics',
    description: 'Develop a model based on evidence to illustrate the life span of the sun and the role of nuclear fusion in the sun\'s core to release energy that eventually reaches Earth in the form of radiation.',
    clarification: 'Emphasis is on the energy transfer mechanisms that allow energy from nuclear fusion in the sun\'s core to reach Earth. Examples of evidence include the astronomical study of the sun\'s light spectra, the predictableness of the sun\'s life span based on fuel reserves and energy release rates, and the life cycle of main-sequence stars compared with other stars.',
    assessmentBoundary: 'Assessment does not include details of the specific nucleosynthesis steps beyond hydrogen fusing into helium or relativistic equations.'
  };

  const SKILLS = [
    {
      id: 'ESS1-1.1',
      title: 'Gravity Against Outward Pressure',
      subtitle: 'Model how inward gravity and outward pressure from core fusion keep the Sun the same size.',
      watchOut: 'The Sun is not a solid ball. Gravity constantly pulls every layer inward, while the hot core pushes outward. If the core cools slightly, gravity squeezes it, heating it back up so fusion steadies the star.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.1_diag',
          skillId: 'ESS1-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'In the Lesson 5-1a star simulator, you cool the Sun\'s core slightly below its normal 15 million K.',
          type: 'two_tier',
          tier1Prompt: 'What happens to the star right after the core cools?',
          tier1Options: [
            'Outward pressure drops, so gravity squeezes the core inward.',
            'Gravity shuts off, so the star swells outward into space.',
            'The star explodes at once because cooler nuclei move faster.',
            'Nothing changes, because the Sun is a rigid solid sphere.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What brings the star back to a steady size after that squeeze?',
          tier2Options: [
            'Squeezing the core heats it and packs nuclei closer, which speeds fusion back up until outward pressure balances gravity again.',
            'Squeezing the core cools it further until chemical burning takes over from nuclear fusion.',
            'Sunlight from the outer surface flows backward into the core to warm it up.',
            'The core freezes into solid iron, which props the outer layers up.'
          ],
          correctTier2: 0,
          hint: 'Two pushes compete: gravity pulling in and thermal/radiation pressure pushing out. Trace what happens when outward pressure dips, and then what squeezing a gas does to its temperature.',
          workedSolution: 'Cooling the core slows fusion and lowers the outward pressure, so inward gravity wins and squeezes the core. That squeeze compresses and heats the core plasma, making hydrogen nuclei collide harder and more often until fusion pressure balances gravity again.',
          givenSummary: 'How gravity and fusion pressure act as a self-correcting thermostat'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.1_diag2',
          skillId: 'ESS1-1.1',
          level: 'Level 2 (Intermediate)',
          stem: 'Imagine that gravity inside the Sun switched off for one second, while the core kept fusing hydrogen at its normal rate.',
          type: 'two_tier',
          tier1Prompt: 'What would happen to the Sun during that second?',
          tier1Options: [
            'Outward pressure would be unbalanced, so the hot gas would push the star outward.',
            'Nothing would change, because a solid crust holds the Sun\'s shape together.',
            'The star would shrink, because fusion pulls the gas toward the core.',
            'The star would stay the same size, because pressure pushes only against gravity.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What does this thought experiment show about how the Sun normally keeps its size?',
          tier2Options: [
            'Gravity pulls in and pressure pushes out all the time, and the two pushes balance.',
            'Gravity does all the work, and outward pressure only appears when the core cools.',
            'The Sun keeps its size because its gas cannot move once it forms a star.',
            'Pressure does all the work, and gravity only matters for the planets.'
          ],
          correctTier2: 0,
          hint: 'Two pushes compete in a star. What happens to a tug-of-war when one team lets go?',
          workedSolution: 'Gravity pulls every layer of the Sun inward, and the hot core pushes outward with pressure. Both act all the time. The Sun keeps its size only because the two pushes balance. Remove gravity, and nothing holds back the pressure, so the gas would rush outward. Here is the trap: the Sun is not a solid ball, so nothing else keeps its shape.',
          givenSummary: 'Thought experiment: switching off gravity in the Sun'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.1_L1',
            skillId: 'ESS1-1.1',
            level: 'Level 1 (Foundational)',
            stem: 'Put these four steps in order (1 = first, 4 = last) when the Sun\'s core temporarily gets a little TOO HOT:',
            type: 'ranking',
            items: [
              'A hotter core runs fusion faster, raising the outward pressure.',
              'Because outward pressure now beats inward gravity, the core expands slightly.',
              'Expanding cools the core and spreads its particles slightly further apart.',
              'With a cooler, less crowded core, the fusion rate settles back to its steady balance.'
            ],
            correctOrder: [
              'A hotter core runs fusion faster, raising the outward pressure.',
              'Because outward pressure now beats inward gravity, the core expands slightly.',
              'Expanding cools the core and spreads its particles slightly further apart.',
              'With a cooler, less crowded core, the fusion rate settles back to its steady balance.'
            ],
            hint: 'Start with the extra heat raising fusion pressure, then follow the expansion and cooling back to balance.',
            workedSolution: 'First, extra core heat speeds up fusion and raises outward pressure (1). Second, outward pressure pushes the core out against gravity (2). Third, expanding cools and thins the core (3). Fourth, fusion slows back down to match gravity again (4).',
            givenSummary: 'Step-by-step response when the solar core overheats'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.1_L3',
            skillId: 'ESS1-1.1',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why has the Sun stayed nearly the same size for 4.6 billion years without collapsing under its own weight or blowing apart?',
            type: 'mcq',
            options: [
              'Inward pull from gravity is balanced at every depth by outward pressure from the hot, fusing core.',
              'A thick crust of solid rock around the core keeps the gas from shrinking or swelling.',
              'Nuclear fusion in the core runs at the exact same speed no matter how hot or dense the core gets.',
              'Earth\'s gravity pulls outward on the Sun\'s surface and holds its layers in place.'
            ],
            correctIndex: 0,
            hint: 'Which two opposing pushes keep a star at a steady size?',
            workedSolution: 'At every layer in the Sun, the inward pull of gravity is balanced by the outward push of hot gas and radiation coming from nuclear fusion in the core.',
            givenSummary: 'Why the Sun stays a steady size: gravity vs outward pressure'
          };
        }
      ]
    },
    {
      id: 'ESS1-1.2',
      title: 'Hydrogen Fusion in the Core',
      subtitle: 'Model how hydrogen nuclei fuse into helium in the Sun\'s core and why fusion happens only in the core.',
      watchOut: 'Fusion happens only in the central core, where the temperature (~15 million K) and density are high enough to slam positive hydrogen nuclei together against their electric repulsion. The outer layers of the Sun are too cool and thin for fusion.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.2_diag',
          skillId: 'ESS1-1.2',
          level: 'Level 2 (Intermediate)',
          stem: 'In the Sun\'s core, hydrogen nuclei (protons) fuse to form helium nuclei, even though every proton carries a positive charge.',
          type: 'two_tier',
          tier1Prompt: 'What condition in the core lets positive protons get close enough to fuse?',
          tier1Options: [
            'Extreme temperature (~15 million K) and crushing pressure make protons collide fast enough to overcome electric repulsion.',
            'Protons pull in outer electrons to become neutral atoms before they touch.',
            'Protons slow down to a stop so gravity can pull them together gently.',
            'The core is cold enough for hydrogen to freeze into a solid crystal.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why doesn\'t nuclear fusion happen at the Sun\'s visible surface (photosphere, ~5,800 K)?',
          tier2Options: [
            'At 5,800 K the gas is too cool and thin, so colliding protons bounce apart before fusing.',
            'The visible surface contains no hydrogen gas at all, only solid iron and heavy silicate rock.',
            'Sunlight at the surface pushes all protons out into space before they can ever collide.',
            'Strong magnetic fields at the surface completely turn off the short-range strong nuclear force.'
          ],
          correctTier2: 0,
          hint: 'Like charges repel. Compare the speed and crowding of protons at 15 million K in the core versus 5,800 K at the surface.',
          workedSolution: 'Positive protons repel each other electrically. Only in the central core, where gravity compresses the gas to huge density and heats it to about 15 million K, do protons slam together hard enough for the short-range strong nuclear force to bind them into helium. At the 5,800 K surface, collisions are far too gentle.',
          givenSummary: 'Why hydrogen fuses into helium in the core but not at the surface'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.2_diag2',
          skillId: 'ESS1-1.2',
          level: 'Level 2 (Intermediate)',
          stem: 'The base of the Sun\'s outer convection zone is mostly hydrogen at about 2 million K. No fusion happens there.',
          type: 'two_tier',
          tier1Prompt: 'Why doesn\'t hydrogen fuse at the base of the convection zone?',
          tier1Options: [
            'The gas is too cool and thin, so protons rarely hit hard enough to overcome their repulsion.',
            'There is no hydrogen in the outer layers, only helium carried up from the core.',
            'The outer layers are solid, so the protons there cannot move to collide.',
            'Gravity there is too weak to pull the protons apart before they fuse.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What do protons need before they can fuse?',
          tier2Options: [
            'They must hit fast enough, and often enough, to get close despite their positive charges.',
            'They must first capture electrons, so they become neutral hydrogen atoms.',
            'They must slow down, so the strong force has time to grab them.',
            'They must reach the surface, where sunlight can push them together.'
          ],
          correctTier2: 0,
          hint: 'Protons repel each other. Compare 2 million K with the 15 million K in the core.',
          workedSolution: 'Every proton is positive, so protons push each other away. To fuse, two protons must hit so hard that they get close enough for the strong force to take over. In the core, at about 15 million K and crushing density, that happens constantly. At 2 million K, protons move too slowly and are too spread out, so they bounce apart.',
          givenSummary: 'Why the convection zone does not fuse hydrogen'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.2_L1',
            skillId: 'ESS1-1.2',
            level: 'Level 1 (Foundational)',
            stem: 'What is the overall change in element identity during main-sequence fusion in the Sun\'s core?',
            type: 'mcq',
            options: [
              'Four hydrogen nuclei fuse to form one helium-4 nucleus and release energy.',
              'One helium-4 nucleus splits apart into four hydrogen nuclei and absorbs energy.',
              'Hydrogen and oxygen atoms share electrons to form water vapor and heat.',
              'Carbon and oxygen nuclei fuse to form solid iron in the Sun\'s core today.'
            ],
            correctIndex: 0,
            hint: 'Which fuel is the Sun fusing right now, and what element is building up as the "ash" in its core?',
            workedSolution: 'During its main-sequence life, the Sun fuses hydrogen nuclei (protons) into helium-4 nuclei in its core, releasing the energy that keeps the star hot and bright.',
            givenSummary: 'Overall fuel and product of solar core fusion'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.2_L3',
            skillId: 'ESS1-1.2',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'How do astronomers confirm from Earth that the Sun is made mostly of hydrogen and helium?',
            type: 'mcq',
            options: [
              'Dark absorption lines in the Sun\'s light spectrum match the exact wavelengths absorbed by hydrogen and helium in a lab.',
              'Spacecraft have scooped solid samples out of the Sun\'s core and brought them back to Earth.',
              'Only hydrogen and helium can glow yellow when heated to 5,800 K.',
              'Sonar sound waves sent from Earth bounce off the Sun and measure its atomic mass.'
            ],
            correctIndex: 0,
            hint: 'Each element absorbs its own barcode of wavelengths in a light spectrum.',
            workedSolution: 'Every element absorbs a unique pattern of wavelengths. When sunlight is spread into a spectrum, the dark absorption lines match the laboratory fingerprints of hydrogen and helium, showing that the Sun ismostly hydrogen and helium.',
            givenSummary: 'Using absorption spectra as evidence of the Sun\'s composition'
          };
        }
      ]
    },
    {
      id: 'ESS1-1.3',
      title: 'Nuclear vs. Chemical Energy Scale',
      subtitle: 'Explain why nuclear fusion can power the Sun for 10 billion years while chemical burning would run out in thousands of years.',
      watchOut: 'In the 1800s, scientists wondered if the Sun was a giant ball of burning coal. Burning rearranges outer electrons and would use up the Sun in a few thousand years. Fusion changes the nucleus, where forces are millions of times stronger, giving 10 billion years of fuel.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.3_diag',
          skillId: 'ESS1-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Rocks and fossils on Earth show that the Sun has been shining for about 4.6 billion years.',
          type: 'two_tier',
          tier1Prompt: 'Why did that geological age rule out chemical burning (like coal and oxygen) as the Sun\'s power source?',
          tier1Options: [
            'Even a Sun-sized ball of coal and oxygen would burn out in a few thousand years.',
            'Coal cannot burn at temperatures above 1,000 °C, so the fire would go out in the core.',
            'Chemical burning of fuel always absorbs thermal energy from the surroundings instead of releasing it.',
            'Chemical burning makes stars grow heavier every year until they collapse into black holes.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why can nuclear fusion power the Sun millions of times longer than chemical burning for the same mass of fuel?',
          tier2Options: [
            'Nuclear fusion converts a small fraction of nuclear mass into millions of times more energy per gram than electron bonds.',
            'Hydrogen atoms are much larger than carbon atoms, so each hydrogen atom takes a million years to burn.',
            'The Sun pulls fresh hydrogen gas in from Earth\'s oceans every day to replace what it burns.',
            'Fusion uses up zero fuel because the helium product immediately splits back into fresh hydrogen nuclei.'
          ],
          correctTier2: 0,
          hint: 'Compare the energy released per gram when outer electrons rearrange (burning) versus when nuclei fuse (1 g of mass ≈ 3,500 tons of coal).',
          workedSolution: 'Chemical burning only shifts outer electrons and releases a few kilojoules per gram, which could power the Sun for only a few thousand years. Nuclear fusion rearranges the nucleus and converts about 0.7% of the hydrogen\'s mass into energy, releasing millions of times more energy per gram and powering the Sun for about 10 billion years.',
          givenSummary: 'Why only nuclear fusion can power the Sun for billions of years'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.3_diag2',
          skillId: 'ESS1-1.3',
          level: 'Level 2 (Intermediate)',
          stem: 'Fusing one gram of hydrogen into helium releases millions of times more energy than burning one gram of coal.',
          type: 'two_tier',
          tier1Prompt: 'If the Sun were a ball of burning coal, how long could it shine as brightly as it does now?',
          tier1Options: [
            'Only a few thousand years, instead of about 10 billion years.',
            'About 10 billion years, because the Sun would have the same mass.',
            'Forever, because burning coal makes new fuel as it goes.',
            'About 100 million years, because coal burns slowly in space.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why is the energy per gram so much larger for fusion?',
          tier2Options: [
            'Fusion changes the nucleus, where the strong force binds particles far tighter than outer electrons are held.',
            'Hydrogen atoms are larger than carbon atoms, so each one stores more energy inside it.',
            'Fusion creates new energy from nothing, while burning only moves energy around.',
            'Coal loses most of its energy as smoke, while fusion loses none at all.'
          ],
          correctTier2: 0,
          hint: 'Burning moves outer electrons. Fusion changes the nucleus. Which one involves the stronger force?',
          workedSolution: 'Burning coal only rearranges outer electrons. A Sun-sized ball of coal would run out in a few thousand years, far less than the 4.6 billion years shown by rocks and fossils. Fusion changes the nucleus, where the strong force binds particles millions of times more tightly. So each gram of hydrogen gives millions of times more energy, enough for about 10 billion years.',
          givenSummary: 'A coal Sun vs a fusion Sun: energy per gram'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.3_L1',
            skillId: 'ESS1-1.3',
            level: 'Level 1 (Foundational)',
            stem: 'Sort each statement under Nuclear Fusion in the Sun\'s Core or Chemical Burning (like coal or wood):',
            type: 'categorize',
            categories: ['Nuclear Fusion (Sun\'s Core)', 'Chemical Burning (Coal or Wood)'],
            items: [
              { label: 'Joins hydrogen nuclei into helium nuclei and converts a small fraction of mass into energy', correctCategoryIndex: 0 },
              { label: 'Rearranges outer electrons between atoms while every nucleus stays the same element', correctCategoryIndex: 1 },
              { label: 'Releases enough energy per gram to keep the Sun shining for about 10 billion years', correctCategoryIndex: 0 },
              { label: 'Would use up a Sun-sized mass of fuel in only a few thousand years', correctCategoryIndex: 1 }
            ],
            hint: 'Nuclear fusion changes the nucleus and lasts billions of years; chemical burning only shifts outer electrons.',
            workedSolution: 'Nuclear fusion joins hydrogen nuclei into helium and releases millions of times more energy per gram than chemical reactions, sustaining the Sun for 10 billion years. Chemical burning only rearranges outer electrons and would exhaust the Sun in a few thousand years.',
            givenSummary: 'Nuclear fusion vs chemical burning'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.3_L3',
            skillId: 'ESS1-1.3',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Each helium-4 nucleus formed in the Sun\'s core has about 0.7% less mass than the four hydrogen nuclei that fused to make it. What happens to that missing 0.7% of mass?',
            type: 'mcq',
            options: [
              'It turns into the energy (photons and particle motion) that heats the Sun and shines into space.',
              'It settles to the very center of the Sun and builds up a dense solid iron core.',
              'It turns into extra electrons that orbit outside the Sun\'s surface like tiny rocky planets.',
              'Nothing happens to it; laboratory scales cannot weigh helium nuclei accurately at high core temperatures.'
            ],
            correctIndex: 0,
            hint: 'Where does the energy released in a fusion reaction come from?',
            workedSolution: 'When four protons fuse into a tightly bound helium-4 nucleus, the product weighs about 0.7% less than the starting protons. That small mass difference turns directly into energy that heats the core and eventually leaves the Sun as sunlight.',
            givenSummary: 'Where the missing 0.7% of mass goes in solar fusion'
          };
        }
      ]
    },
    {
      id: 'ESS1-1.4',
      title: 'How Energy Reaches Earth',
      subtitle: 'Trace how energy from core fusion travels through the Sun\'s layers and across space to Earth as radiation.',
      watchOut: 'Energy made in the core does not zip straight out of the Sun in a second. Photons bounce and scatter through the dense radiative zone for over 100,000 years, then convection carries heat to the surface, and finally light crosses space to Earth in 8 minutes.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.4_diag',
          skillId: 'ESS1-1.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Once light leaves the Sun\'s surface, it reaches Earth in about 8 minutes. Yet energy made in the Sun\'s core takes over 100,000 years just to reach the Sun\'s surface.',
          type: 'two_tier',
          tier1Prompt: 'Why does it take over 100,000 years for energy to get from the core to the surface?',
          tier1Options: [
            'Photons scatter trillions of times in the dense interior before convection carries heat to the surface.',
            'Light waves always move billions of times slower in a vacuum than they do through room air.',
            'Gravity holds light waves trapped in circular orbits around helium nuclei inside the central core.',
            'Nuclear fusion in the core stops completely for 100,000 years between each brief burst of energy.'
          ],
          correctTier1: 0,
          tier2Prompt: 'How does that energy cross the 150 million km of empty space from the Sun\'s surface to Earth?',
          tier2Options: [
            'It travels as electromagnetic radiation (light), which needs no matter to cross the vacuum of space.',
            'It is carried across space by hot air currents rising directly from the Sun to Earth.',
            'It conducts along a solid bridge of dust particles stretching all the way from the Sun to Earth.',
            'It travels as high-pitched sound waves echoing through the empty vacuum between the Sun and Earth.'
          ],
          correctTier2: 0,
          hint: 'Inside the dense Sun, photons bounce off packed particles; outside in empty space, only radiation can cross a vacuum.',
          workedSolution: 'Inside the radiative zone, the plasma is so dense that a photon travels less than a millimeter before hitting a particle and scattering in a new direction, taking over 100,000 years to work its way out to the convective zone and photosphere. Once emitted at the surface, light travels straight through the vacuum of space as radiation and reaches Earth in about 8 minutes.',
          givenSummary: 'Why energy takes 100,000+ years inside the Sun and 8 minutes across space'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.4_diag2',
          skillId: 'ESS1-1.4',
          level: 'Level 2 (Intermediate)',
          stem: 'Photos of the Sun\'s surface show a pattern of bright cells with dark edges, like a pot of boiling soup.',
          type: 'two_tier',
          tier1Prompt: 'How does energy move through the outer layer of the Sun that makes this pattern?',
          tier1Options: [
            'Hot gas rises, gives off energy at the surface, cools, and sinks again (convection).',
            'Photons fly straight out from the core in about one second without hitting anything.',
            'Energy passes atom to atom through a solid layer of iron, the way heat moves through a pan.',
            'Sound waves carry the energy up from the core and shake the surface into cells.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does the energy take so long to cross the deeper radiative zone below?',
          tier2Options: [
            'Photons there scatter off packed particles countless times, so each one follows a long zigzag path.',
            'Light moves slower than sound inside the Sun, so the light falls behind.',
            'Gravity pulls each photon back toward the core after it moves a short way.',
            'Fusion pauses for thousands of years between each burst of light.'
          ],
          correctTier2: 0,
          hint: 'The bright cells are hot gas coming up. The dark edges are cooler gas going down. What is that kind of flow called?',
          workedSolution: 'Deep inside, photons scatter off the packed particles of the radiative zone so many times that the energy takes over 100,000 years to work outward. In the outer convection zone, hot gas rises, gives off its energy at the surface, cools, and sinks. The bright cells are rising gas; the dark edges are sinking gas. From the surface, light crosses space to Earth in about 8 minutes.',
          givenSummary: 'Convection cells on the Sun and the slow radiative zone'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.4_L1',
            skillId: 'ESS1-1.4',
            level: 'Level 1 (Foundational)',
            stem: 'Order the journey of solar energy from where it is made (1) to its arrival at Earth (4):',
            type: 'ranking',
            items: [
              'Core: hydrogen nuclei fuse into helium at about 15 million K, releasing high-energy gamma photons.',
              'Radiative zone: photons are absorbed and re-emitted again and again as they slowly work their way outward.',
              'Convective zone: hot plasma rises toward the surface, cools, and sinks back down in giant loops.',
              'Photosphere and space: light leaves the 5,800 K surface and travels across vacuum to Earth in 8 minutes.'
            ],
            correctOrder: [
              'Core: hydrogen nuclei fuse into helium at about 15 million K, releasing high-energy gamma photons.',
              'Radiative zone: photons are absorbed and re-emitted again and again as they slowly work their way outward.',
              'Convective zone: hot plasma rises toward the surface, cools, and sinks back down in giant loops.',
              'Photosphere and space: light leaves the 5,800 K surface and travels across vacuum to Earth in 8 minutes.'
            ],
            hint: 'Work from the center of the Sun outward: core -> radiative zone -> convective zone -> photosphere to Earth.',
            workedSolution: 'Energy starts in the core (fusion), diffuses slowly through the radiative zone, rides rising currents through the convective zone, and leaves the photosphere as sunlight that crosses space to Earth in 8 minutes.',
            givenSummary: 'Four-step path of energy from the Sun\'s core to Earth'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.4_L3',
            skillId: 'ESS1-1.4',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Fusion in the 15-million-K core produces high-energy gamma-ray photons, yet the sunlight reaching Earth is mostly lower-energy visible and infrared light. Why?',
            type: 'mcq',
            options: [
              'Repeated absorptions and re-emissions split each gamma photon\'s energy among thousands of lower-energy photons emitted at the cooler 5,800 K surface.',
              'The convective zone is made of solid lead that blocks gamma rays and only lets yellow visible light pass through.',
              'High-energy gamma rays turn into visible light only when they hit Earth\'s upper magnetic field and atmosphere.',
              'Gamma rays lose most of their energy because empty space slows photons down on the long trip to Earth.'
            ],
            correctIndex: 0,
            hint: 'Compare the temperature of the core (15 million K) with the temperature of the visible surface (5,800 K) that actually sends light into space.',
            workedSolution: 'Gamma photons made in the core never fly straight out. Over 100,000+ years of absorptions and re-emissions, their energy heats the surrounding gas. By the time energy reaches the much cooler 5,800 K photosphere, it is radiated into space as thousands of lower-energy visible, infrared, and UV photons.',
            givenSummary: 'Why core gamma energy leaves the Sun\'s surface mostly as visible and infrared light'
          };
        }
      ]
    },
    {
      id: 'ESS1-1.5',
      title: 'Star Mass, Brightness & Lifespan',
      subtitle: 'Explain why more massive stars burn much brighter and run out of fuel much faster than smaller stars.',
      watchOut: 'Here is the trap: "a bigger star has more fuel, so it lives longer." It does not! A star with twice the Sun\'s mass has a much stronger gravitational squeeze, so its core burns about 16 times brighter and uses up its fuel in about 1.25 billion years instead of 10 billion.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.5_diag',
          skillId: 'ESS1-1.5',
          level: 'Level 2 (Intermediate)',
          stem: 'In Lesson 5-1a, a star with 2 times the mass of the Sun shines about 16 times as bright as the Sun.',
          type: 'two_tier',
          tier1Prompt: 'How does that 2-solar-mass star\'s main-sequence lifetime compare with the Sun\'s 10-billion-year lifetime?',
          tier1Options: [
            'It lives a much shorter life (about 1.25 billion years, one eighth as long as the Sun).',
            'It lives twice as long (about 20 billion years) because it starts with twice as much hydrogen.',
            'It lives 16 times as long (160 billion years) because brighter stars burn fuel more cleanly.',
            'It lives the exact same 10 billion years because all stars have the same lifetime.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does having more mass shorten a star\'s life so dramatically?',
          tier2Options: [
            'More mass creates a stronger gravitational squeeze, heating the core so it burns through its fuel many times faster.',
            'More massive stars have colder cores that cannot fuse all of their hydrogen.',
            'Massive stars blow most of their hydrogen into planets before fusion even starts.',
            'Small stars make new hydrogen out of empty space, while massive stars cannot.'
          ],
          correctTier2: 0,
          hint: 'Lifetime ≈ (amount of fuel) / (how fast it burns). With 2x the fuel burning 16x as fast, lifetime is 2 / 16 = 1/8 as long.',
          workedSolution: 'A star with 2 solar masses has twice as much hydrogen fuel, but its stronger gravity crushes and heats the core so hard that it burns fuel 16 times faster. 2 / 16 = 1/8 of the Sun\'s 10-billion-year life, or about 1.25 billion years.',
          givenSummary: 'Why a 2-solar-mass star shines 16x brighter and lives 1/8 as long'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.5_diag2',
          skillId: 'ESS1-1.5',
          level: 'Level 2 (Intermediate)',
          stem: 'A star with half the mass of the Sun (0.5 solar masses) shines about 1/16 as bright as the Sun.',
          type: 'two_tier',
          tier1Prompt: 'How does that star\'s main-sequence lifetime compare with the Sun\'s 10-billion-year lifetime?',
          tier1Options: [
            'It lives about 8 times longer, about 80 billion years.',
            'It lives half as long, about 5 billion years, because it has half the fuel.',
            'It lives 16 times shorter, because dim stars waste their fuel.',
            'It lives the same 10 billion years, because all stars do.'
          ],
          correctTier1: 0,
          tier2Prompt: 'Why does having less mass make a star live so much longer?',
          tier2Options: [
            'Less mass squeezes the core less, so it burns its smaller fuel supply far more slowly.',
            'Small stars make new hydrogen from empty space as they age.',
            'Dim stars have hotter cores, and hotter cores use fuel more carefully.',
            'A smaller star has no gravity, so its fuel never gets used up.'
          ],
          correctTier2: 0,
          hint: 'Lifetime is roughly (fuel) divided by (how fast it burns). Half the fuel, burning at 1/16 the rate: 0.5 / (1/16) = ?',
          workedSolution: 'The star has half the Sun\'s fuel, but it burns that fuel at only 1/16 of the Sun\'s rate. Lifetime is about fuel divided by burn rate: 0.5 / (1/16) = 8 times the Sun\'s, about 80 billion years. Less mass means a weaker squeeze on the core, a cooler core, and much slower fusion. The trap is thinking "less fuel, shorter life."',
          givenSummary: 'Lifetime of a 0.5-solar-mass star'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.5_L1',
            skillId: 'ESS1-1.5',
            level: 'Level 1 (Foundational)',
            stem: 'Radiometric dating of meteorites shows the solar system is about 4.6 billion years old, and the Sun\'s core holds enough hydrogen for about 10 billion years in total. Where is the Sun in its main-sequence life?',
            type: 'mcq',
            options: [
              'Roughly halfway through its stable hydrogen-fusing life, with about 5 billion years of core hydrogen left.',
              'At the very end of its life, ready to run out of hydrogen within the next thousand years.',
              'Near the very beginning, having used less than 1% of its core hydrogen.',
              'Already out of core hydrogen and fusing iron into gold.'
            ],
            correctIndex: 0,
            hint: 'Compare 4.6 billion years used so far with a 10-billion-year total supply.',
            workedSolution: 'At 4.6 billion years old out of a 10-billion-year fuel supply, the Sun is roughly halfway through its stable main-sequence phase, with about 5 billion years of hydrogen fusion remaining.',
            givenSummary: 'The Sun\'s current age (4.6 billion years) vs total main-sequence lifespan (10 billion years)'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.5_L3',
            skillId: 'ESS1-1.5',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'A small red dwarf star has only 0.10 times the mass of the Sun, and its dim core burns fuel at 0.001 (one thousandth) of the Sun\'s rate. Why can a red dwarf shine for trillions of years?',
            type: 'mcq',
            options: [
              'Its weaker gravity keeps its core cooler, so it sips its fuel at a thousandth of the Sun\'s rate.',
              'Its gravity is so strong that hydrogen protons in the core can never fuse together at all.',
              'It burns solid coal and oxygen gas instead of fusing hydrogen nuclei into helium in its core.',
              'It orbits close to giant stars and continually steals fresh hydrogen fuel from their outer layers.'
            ],
            correctIndex: 0,
            hint: 'Divide fuel by burn rate: 0.10 / 0.001 = 100 times the Sun\'s 10-billion-year lifetime.',
            workedSolution: 'With only a tenth of the Sun\'s mass, a red dwarf\'s gravity squeezes its core gently, so fusion runs at only 1/1,000 of the Sun\'s rate. Having 1/10 the fuel and burning it 1,000 times slower lets it live about 0.10 / 0.001 = 100 times longer than the Sun (around a trillion years).',
            givenSummary: 'Why low-mass red dwarfs live for trillions of years'
          };
        }
      ]
    },
    {
      id: 'ESS1-1.6',
      title: 'What Happens When the Sun\'s Hydrogen Runs Out',
      subtitle: 'Trace the Sun\'s future after core hydrogen runs out: red giant, outer layers shed, and a cooling white dwarf.',
      watchOut: 'The Sun is not massive enough to explode as a supernova or make iron. After its core hydrogen runs out in ~5 billion years, it will swell into a red giant, fuse helium into carbon and oxygen, shed its outer gas, and leave behind a dense white dwarf.',
      diagnostic: function(rng) {
        return {
          id: 'ESS1-1.6_diag',
          skillId: 'ESS1-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'In about 5 billion years, the Sun will run out of hydrogen fuel in its central core.',
          type: 'two_tier',
          tier1Prompt: 'What happens to the Sun when core hydrogen fusion stops?',
          tier1Options: [
            'The core contracts and heats up while outer layers swell enormously into a red giant.',
            'The Sun explodes at once as a supernova and leaves a black hole behind.',
            'The Sun freezes overnight into a cold ball of solid hydrogen.',
            'The Sun starts fusing iron into gold without changing its size.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What will the Sun leave behind at the very end of its life?',
          tier2Options: [
            'A hot, Earth-sized carbon-oxygen white dwarf that slowly cools, surrounded by glowing gas it shed.',
            'A spinning neutron star packed entirely with neutrons and crushed to the size of a city.',
            'A stellar-mass black hole whose intense gravity traps all light inside an event horizon.',
            'A brand-new main-sequence star made of pure hydrogen that starts the cycle all over again.'
          ],
          correctTier2: 0,
          hint: 'Only stars above about 8 solar masses explode as supernovae. What happens to a 1-solar-mass star like our Sun?',
          workedSolution: 'When core hydrogen runs out, gravity squeezes the helium core while hydrogen fuses in a shell around it, swelling the outer layers into a red giant. The core gets hot enough to fuse helium into carbon and oxygen, then the outer layers drift off and leave a dense carbon-oxygen white dwarf that slowly cools.',
          givenSummary: 'The Sun\'s future: red giant to carbon-oxygen white dwarf'
        };
      },
      // A second Level 2 item: used for the check after a hint, or the retry after Level 1.
      diagnosticAlt: function(rng) {
        return {
          id: 'ESS1-1.6_diag2',
          skillId: 'ESS1-1.6',
          level: 'Level 2 (Intermediate)',
          stem: 'As a red giant, the Sun\'s outer layers will swell out past the orbit of Mercury, even though its core is shrinking.',
          type: 'two_tier',
          tier1Prompt: 'Why will the outer layers swell while the core shrinks?',
          tier1Options: [
            'Hydrogen fusing in a shell around the core heats the outer layers and pushes them outward.',
            'The core explodes, and the blast throws the outer layers far out into space.',
            'The Sun gains new hydrogen from the planets it swallows, so it grows larger.',
            'The outer layers cool and expand, the way water expands when it freezes.'
          ],
          correctTier1: 0,
          tier2Prompt: 'What will those outer layers form at the end of the Sun\'s life?',
          tier2Options: [
            'A glowing shell of gas drifting away from a hot, Earth-sized white dwarf.',
            'A ring of new planets that orbit the leftover core.',
            'A supernova blast that spreads iron through the galaxy.',
            'A black hole that pulls all of the shed gas back in.'
          ],
          correctTier2: 0,
          hint: 'When core hydrogen runs out, fusion moves to a shell around the core. What does extra heat from that shell do to the gas above it?',
          workedSolution: 'When core hydrogen runs out, gravity squeezes the helium core and heats it. Hydrogen now fuses in a shell around the core, and that extra heat pushes the outer layers far out: a red giant. Later the Sun sheds those outer layers as a glowing shell of gas. The core is left behind as a white dwarf about the size of Earth. The Sun has too little mass to explode as a supernova.',
          givenSummary: 'Why the red giant swells, and what its shed layers form'
        };
      },
      practiceLevels: [
        function level1(rng) {
          return {
            id: 'ESS1-1.6_L1',
            skillId: 'ESS1-1.6',
            level: 'Level 1 (Foundational)',
            stem: 'Order the four stages of the Sun\'s life cycle from birth (1) to final remnant (4):',
            type: 'ranking',
            items: [
              'A cloud of gas and dust collapses under gravity until the core is hot enough to start fusion.',
              'Main-sequence star: fuses hydrogen into helium in the core for about 10 billion years.',
              'Red giant: core hydrogen runs out, the outer layers swell, and helium fuses into carbon and oxygen.',
              'White dwarf: the outer layers drift away, leaving a dense carbon-oxygen core that slowly cools.'
            ],
            correctOrder: [
              'A cloud of gas and dust collapses under gravity until the core is hot enough to start fusion.',
              'Main-sequence star: fuses hydrogen into helium in the core for about 10 billion years.',
              'Red giant: core hydrogen runs out, the outer layers swell, and helium fuses into carbon and oxygen.',
              'White dwarf: the outer layers drift away, leaving a dense carbon-oxygen core that slowly cools.'
            ],
            hint: 'Follow a 1-solar-mass star in time: collapsing gas cloud -> main sequence -> red giant -> white dwarf.',
            workedSolution: 'The Sun formed from a collapsing cloud of gas and dust (1), spends ~10 billion years on the main sequence fusing hydrogen into helium (2), swells into a red giant that fuses helium into carbon and oxygen (3), and ends as a cooling carbon-oxygen white dwarf after shedding its outer gas (4).',
            givenSummary: 'Four stages of the Sun\'s life cycle'
          };
        },
        function level3(rng) {
          return {
            id: 'ESS1-1.6_L3',
            skillId: 'ESS1-1.6',
            level: 'Level 3 (Mastery Challenge)',
            stem: 'Why will the Sun end its life as a white dwarf made of carbon and oxygen instead of exploding as a supernova?',
            type: 'mcq',
            options: [
              'With only 1 solar mass, the Sun\'s gravity is too weak to heat its core enough to fuse carbon into heavier elements.',
              'The Sun spins too fast for gravity to pull its core inward after helium runs out.',
              'Carbon and oxygen nuclei have no protons, so they can never fuse in any star.',
              'Earth and Jupiter pull heat out of the Sun and keep it from exploding.'
            ],
            correctIndex: 0,
            hint: 'Compare the gravitational squeeze in a 1-solar-mass star with a massive star (>8 solar masses).',
            workedSolution: 'Fusing carbon and oxygen into heavier elements takes much higher temperatures and pressures than a 1-solar-mass star\'s gravity can produce. After making carbon and oxygen from helium, the Sun\'s core never gets hot enough for the next fusion stage and settles down as a white dwarf.',
            givenSummary: 'Why a 1-solar-mass star stops at carbon and oxygen instead of going supernova'
          };
        }
      ]
    }
  ];

  window.PE_DATA_HS_ESS1_1 = {
    info: PE_INFO,
    skills: SKILLS
  };
})();
