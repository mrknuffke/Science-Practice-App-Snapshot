import { SimulationAboutContent } from '../shared/AboutPanel';

export const HW_ABOUT: SimulationAboutContent = {
  title: 'Population Genetics',
  summary:
    'Explore Hardy-Weinberg equilibrium and the evolutionary forces that disrupt it. Watch allele frequencies shift across generations in a live simulated gene pool.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Each creature in the grid represents one diploid organism with a specific genotype: <strong>AA</strong>, <strong>Aa</strong>, or <strong>aa</strong>.',
        'Creature coloration reflects its genotype: dark blue for homozygous dominant AA, purple for heterozygous Aa, and emerald for homozygous recessive aa.',
        '<strong>p</strong> represents the frequency of the dominant A allele; <strong>q</strong> represents the frequency of the recessive a allele. Together, p + q = 1.',
        'The <strong>Allele Frequency graph</strong> tracks how p and q shift across generations.',
        'The <strong>Genotype Frequency graph</strong> plots the proportion of AA, Aa, and aa individuals in the population over time.',
        'The <strong>H-W Stats panel</strong> compares your observed genotype counts against the expected proportions predicted by p² + 2pq + q².',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Population size (N)</strong>: Smaller populations experience much stronger genetic drift from generation to generation.',
        '<strong>Selection coefficient (s)</strong>: How severely a genotype is disadvantaged (0 = neutral fitness, 1 = lethal).',
        '<strong>Selection type</strong>: Choose which genotype is selected against: none, directional selection favoring A, or directional selection favoring a.',
        '<strong>Mutation rate (µ)</strong>: The rate at which the dominant A allele mutates to recessive a each generation.',
        '<strong>Migration rate (m)</strong>: The fraction of the gene pool replaced each generation by incoming immigrants.',
        '<strong>Genetic drift toggle</strong>: Switch off drift to isolate the mathematical effects of selection, mutation, or gene flow alone.',
        '<strong>Speed</strong>: Slow down to observe generational steps one by one, or speed up to watch long-term equilibrium take shape.',
        'Tuning sliders while <strong>paused</strong> re-seeds the population with your new baseline parameters.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Verify H-W equilibrium:</strong> Keep all forces at zero with a large population and drift turned off. Hit play: do allele frequencies stay flat generation after generation?',
        '<strong>Watch drift in a tiny gene pool:</strong> Set N = 10, turn drift on, and leave all other forces off. Run multiple trials: how many generations does it take for one allele to fix completely by pure luck?',
        '<strong>Selection vs. drift:</strong> Apply mild selection (s = 0.2 favoring A) in a population of N = 500 versus N = 20. Can random drift overpower natural selection in the smaller group?',
        '<strong>Mutation-selection balance:</strong> Set strong selection against the recessive allele, but add a low forward mutation rate. Watch p level off at a stable plateau instead of reaching 100%.',
        '<strong>Rescue by gene flow:</strong> Drive an allele close to extinction with selection, then turn on immigration from an outside population. Can gene flow rescue genetic diversity?',
        '<strong>Model a population bottleneck:</strong> Let a large population settle into equilibrium, pause the simulation, drop N to 10, and hit play again. Notice how quickly genetic variation collapses.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Hardy-Weinberg Equilibrium:</strong> In a large, randomly mating population free from selection, mutation, migration, and drift, allele frequencies remain constant and genotypes follow p² + 2pq + q².',
        '<strong>Genetic Drift:</strong> Random fluctuations in allele frequency caused by sampling error during reproduction: strongest in small populations.',
        '<strong>Natural Selection:</strong> Differential reproductive success among genotypes that shifts allele frequencies directionally toward adaptive traits.',
        '<strong>Mutation:</strong> The ultimate source of new genetic variation: at equilibrium, new mutations balance selective removal.',
        '<strong>Gene Flow:</strong> Movement of fertile individuals or gametes between populations, reducing genetic differences between groups.',
        '<strong>Allele Fixation:</strong> When an allele reaches 100% frequency (p = 1 or q = 1), genetic variation at that locus is lost until restored by mutation or immigration.',
      ],
    },
  ],
};

