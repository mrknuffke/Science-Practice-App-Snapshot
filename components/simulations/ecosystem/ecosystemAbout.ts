import { SimulationAboutContent } from '../shared/AboutPanel';

export const ECOSYSTEM_ABOUT: SimulationAboutContent = {
  title: 'Ecosystem Dynamics',
  summary:
    'Watch a living food web unfold in real time. Plants sprout, herbivores graze and reproduce, and carnivores hunt. Tweak environmental rates and organism traits to see how energy flows across trophic levels.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Green squares</strong>: Plants (primary producers). They convert sunlight into food and regrow after being grazed.',
        '<strong>Blue shapes</strong>: Herbivores (primary consumers). They wander, graze on plants for energy, and reproduce when well-nourished.',
        '<strong>Dark shapes</strong>: Carnivores (secondary consumers). They hunt herbivores and reproduce when they store enough energy.',
        '<strong>Beige squares</strong>: Bare soil. Patches recently grazed that are waiting on their regrowth timer.',
        '<strong>Population Trends graph</strong>: Real-time census tracking all three populations as they rise, fall, or stabilize.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Play / Pause</strong>: Start or pause the clock to observe snapshot patterns or long-term trends.',
        '<strong>Speed</strong>: Drag left to observe individual hunting and grazing interactions; drag right to speed through multi-generation dynamics.',
        '<strong>Reset</strong>: Re-seed the landscape using your chosen starting sliders.',
        '<strong>Plant Regrowth Time</strong>: How many ticks a bare patch takes to regrow. Lower values mean faster food recovery.',
        '<strong>Reproduction Chances</strong>: The likelihood that a well-fed herbivore or carnivore produces offspring each tick.',
        '<strong>Energy Values</strong>: How many energy units an animal extracts from each plant grazed or prey caught.',
        '<strong>Seed Counts</strong>: Starting numbers for plants, herbivores, and carnivores when you click Reset.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Find the sweet spot:</strong> Start with default parameters and watch the graph. Do the populations level out into smooth, repeating waves?',
        '<strong>Trigger a population crash:</strong> Crank carnivore birth rate to maximum. What happens to the predator population once all the herbivores vanish?',
        '<strong>Overgrow the world:</strong> Turn plant growth up high and herbivore births down low. Can the landscape become completely carpeted in green?',
        '<strong>Simulate a harsh drought:</strong> Cut the energy gained per plant down to 1 or 2 units. Can your consumer chain survive on meager calories?',
        '<strong>Test small-population vulnerability:</strong> Start with single-digit counts of herbivores and carnivores. Notice how random chance can wipe out a small population even when settings look favorable.',
        '<strong>Ignite a trophic cascade:</strong> Let herbivores overgraze the landscape, then introduce a healthy pack of carnivores. Watch how predator pressure allows plants to stage a dramatic comeback.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Carrying Capacity:</strong> The maximum population size a habitat can support over time, constrained by food and space.',
        '<strong>Predator-Prey Cycles:</strong> Coupled population waves: abundant prey allows predators to multiply, heavy predation thins the prey, predator numbers drop, and prey populations recover.',
        '<strong>Trophic Cascade:</strong> Top-down ecological regulation where changes at the carnivore level ripple downward to transform producer abundance.',
        '<strong>Stochastic Extinction:</strong> When populations drop to low numbers, random bad luck in movement or foraging can drive them extinct even in suitable habitats.',
      ],
    },
  ],
};

