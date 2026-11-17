import { SimulationAboutContent } from '../shared/AboutPanel';

export const ISLAND_ABOUT: SimulationAboutContent = {
  title: 'Island Biogeography',
  summary:
    'A mainland holds 50 bird species. Birds fly out to an island, and some species die out there. Change the island\'s size and its distance from the mainland, then watch how many species it holds once the count settles. Built from the model of Robert MacArthur and E. O. Wilson (1967). Krakatoa and Surtsey settle on the bird counts in SAS General Biology lesson 2b-2.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>The map:</strong> The green strip on the left is the mainland. The circle is the island. Size and distance are drawn on stretched scales, so a tiny island and a huge one both fit.',
        '<strong>Coloured dots:</strong> Each dot on the island is one bird species living there now. Each species keeps its own colour and spot.',
        '<strong>Rings and crosses:</strong> A ring marks a species that just arrived. A cross marks a species that just died out on the island.',
        '<strong>Count graph:</strong> The number of species on the island over time. After a reset, your last run stays as a dashed line.',
        '<strong>Why it settles tab:</strong> The blue line is how many new species arrive each year. The orange line is how many die out each year. The count settles where they cross.',
        '<strong>Watch the list:</strong> All 50 mainland species as numbered squares. Filled squares are on the island now.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Real islands:</strong> Krakatoa and Surtsey start a new, empty island with that island\'s size and distance.',
        '<strong>Island size:</strong> From 0.5 to 1,000 km². A bigger island has room for bigger populations, so fewer species die out.',
        '<strong>Distance from the mainland:</strong> From 1 to 500 km. A farther island is harder for birds to reach, so fewer species arrive.',
        '<strong>Play, 10 years, Reset:</strong> The sim starts paused so you can predict first. "10 years" moves the clock forward while paused. Reset empties the island and keeps the last run on the graph.',
        '<strong>Speed:</strong> 1× runs 5 years each second. 20× runs 100 years each second.',
        '<strong>Volcano:</strong> Wipes every species off the island, as the 1883 eruption did on Krakatoa. The clock keeps running.',
        '<strong>Cut off from the mainland:</strong> Fills the island with the species it held while joined to the mainland. The sea then cuts it off at the distance you chose.',
        '<strong>Record:</strong> Adds a row with the count now and the average over the last 100 years.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Match the textbook:</strong> Run Krakatoa for 200 years at 5×, then press Record. The average lands near 34 bird species. Surtsey lands near 15.',
        '<strong>Change only the size:</strong> Keep Krakatoa\'s 40 km and make the island 280 km². The count settles near 44. Shrink it to 2.8 km² and it settles near 19.',
        '<strong>Change only the distance:</strong> Keep 28 km² and move the island to 400 km. Only about 3 species hold on.',
        '<strong>Is anything still happening?</strong> Let Krakatoa settle, then switch on Watch the list. The count stays near 34, but squares keep switching on and off. About 70 species arrive and die out every 100 years.',
        '<strong>Small islands turn over faster:</strong> Compare the arrivals and extinctions counters on Surtsey and Krakatoa over the same number of years. Surtsey\'s list changes more than twice as fast.',
        '<strong>Erupt Krakatoa:</strong> Let it settle, then press Volcano. The count drops to zero, climbs back, and settles near 34 again.',
        '<strong>Cut an island off:</strong> Set 5 km² and 150 km, then press Cut off. The island starts with about 48 species and slowly falls to about 11.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Species richness:</strong> The number of different species in a place. Here it is the number of bird species on the island.',
        '<strong>Equilibrium:</strong> The count settles when new species arrive at the same rate that species die out. The total stays steady even though the list keeps changing.',
        '<strong>Distance controls arrivals:</strong> Fewer birds cross a wide stretch of sea, so a far island gains new species slowly.',
        '<strong>Size controls losses:</strong> A small island holds only small populations. A small population can die out from one bad storm, disease or breeding season.',
        '<strong>Habitat islands:</strong> A forest patch surrounded by city works like an island. That is why cutting a forest into small, separate pieces loses species.',
        '<strong>A model, calibrated:</strong> The rules are MacArthur and Wilson\'s. Two numbers were tuned so that Krakatoa and Surtsey settle on their real bird counts. Every other setting is the model\'s prediction, not data.',
      ],
    },
  ],
};
