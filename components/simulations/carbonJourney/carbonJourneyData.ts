/**
 * Stage content for Tracking a Carbon Atom: one carbon atom's trip from
 * seawater, through bull kelp and a purple sea urchin, and back to seawater.
 *
 * Science fixes over the original page this was adapted from:
 *  - Energy is released in respiration because the products' bonds are
 *    stronger, not because "high-energy bonds break". Breaking bonds costs energy.
 *  - The oxygen in respired CO₂ comes from glucose and water. O₂ ends up in water.
 *  - Light splits water. The Calvin cycle fixes CO₂ using ATP and NADPH.
 *  - Glucose's ring is five carbons and one oxygen, with the sixth carbon outside.
 *  - Most dissolved carbon in seawater is bicarbonate, not CO₂.
 *  - Bull kelp is Nereocystis; "giant bull kelp" mixed it up with giant kelp.
 */

export type Element = 'C' | 'H' | 'O';

export interface Species {
  formula: string; // Unicode display, e.g. 'C₆H₁₂O₆'
  atoms: Partial<Record<Element, number>>;
}

export const SPECIES = {
  CO2: { formula: 'CO₂', atoms: { C: 1, O: 2 } },
  H2O: { formula: 'H₂O', atoms: { H: 2, O: 1 } },
  O2: { formula: 'O₂', atoms: { O: 2 } },
  GLUCOSE: { formula: 'C₆H₁₂O₆', atoms: { C: 6, H: 12, O: 6 } },
  HCO3: { formula: 'HCO₃⁻', atoms: { H: 1, C: 1, O: 3 } },
  H: { formula: 'H⁺', atoms: { H: 1 } },
  GLUCOSE_UNIT: { formula: 'C₆H₁₀O₅', atoms: { C: 6, H: 10, O: 5 } },
} satisfies Record<string, Species>;

export interface Term {
  coef: number;
  species: Species;
}

export interface Equation {
  reactants: Term[];
  products: Term[];
  /** Plain-words version, read aloud by a teacher. */
  words: string;
  /** What happens to energy, shown beside the arrow. */
  energyNote?: string;
  reversible?: boolean;
}

export interface CheckOption {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface StageCheck {
  question: string;
  options: CheckOption[];
}

export interface Stage {
  id: string;
  short: string;
  title: string;
  /** Where the atom is, as a short phrase. */
  where: string;
  molecule: string;
  carbonForm: 'inorganic' | 'organic' | 'organic-to-inorganic';
  paragraphs: string[];
  equation?: Equation;
  energyIn: string;
  energyOut: string;
  check: StageCheck;
}

export const STAGES: Stage[] = [
  {
    id: 'seawater',
    short: 'In seawater',
    title: 'Your carbon atom starts in seawater',
    where: 'Seawater beside a kelp blade',
    molecule: 'Bicarbonate (HCO₃⁻)',
    carbonForm: 'inorganic',
    paragraphs: [
      'Your carbon atom starts out dissolved in the ocean. Most dissolved carbon in seawater is bicarbonate (HCO₃⁻), not CO₂.',
      'Kelp has no roots feeding it. Its blades take in bicarbonate and some CO₂ straight from the water around them.',
      'Inside the cell, an enzyme turns bicarbonate into CO₂. The chloroplast can only use carbon in the form of CO₂.',
    ],
    equation: {
      reactants: [
        { coef: 1, species: SPECIES.HCO3 },
        { coef: 1, species: SPECIES.H },
      ],
      products: [
        { coef: 1, species: SPECIES.CO2 },
        { coef: 1, species: SPECIES.H2O },
      ],
      words: 'bicarbonate + hydrogen ion → carbon dioxide + water',
      reversible: true,
    },
    energyIn: 'None needed for this step',
    energyOut: 'None. The atom just changes partners.',
    check: {
      question: 'Where does the carbon in a kelp blade come from?',
      options: [
        {
          text: 'Minerals the kelp absorbs from the rock it grips',
          correct: false,
          feedback: 'Tempting, because land plants seem to grow out of soil. But a kelp holdfast is only an anchor. Almost all of a kelp\'s mass is carbon taken from the water.',
        },
        {
          text: 'Carbon dissolved in seawater, mostly bicarbonate and CO₂',
          correct: true,
          feedback: 'Right. Kelp builds its whole body from dissolved carbon, plus water and a few nutrients.',
        },
        {
          text: 'Nitrate and other nutrients dissolved in the water',
          correct: false,
          feedback: 'Kelp does need nitrate, the way a garden needs fertilizer. But nitrate supplies nitrogen, not carbon. Nutrients are a small part of the kelp\'s mass.',
        },
      ],
    },
  },
  {
    id: 'photosynthesis',
    short: 'Photosynthesis',
    title: 'Photosynthesis builds your atom into sugar',
    where: 'Chloroplast in a kelp blade cell',
    molecule: 'Glucose (C₆H₁₂O₆)',
    carbonForm: 'organic',
    paragraphs: [
      'Light hits the chloroplast. Its energy splits water molecules and charges up two carriers, ATP and NADPH. The leftover oxygen leaves as O₂.',
      'Then the Calvin cycle takes over. An enzyme called rubisco attaches your CO₂ to a sugar the cell already has. ATP and NADPH pay the energy cost.',
      'A few steps later, your atom is part of glucose. Kelp stores much of this sugar as laminarin, a long chain of glucose units.',
      'Light did not become your atom. The atom came from seawater. Light supplied energy, which is now chemical energy in glucose and oxygen.',
    ],
    equation: {
      reactants: [
        { coef: 6, species: SPECIES.CO2 },
        { coef: 6, species: SPECIES.H2O },
      ],
      products: [
        { coef: 1, species: SPECIES.GLUCOSE },
        { coef: 6, species: SPECIES.O2 },
      ],
      words: 'carbon dioxide + water → glucose + oxygen',
      energyNote: 'light energy in',
    },
    energyIn: 'Light from the Sun',
    energyOut: 'Stored as chemical energy in glucose and O₂',
    check: {
      question: 'The kelp used light energy to make glucose. What happened to that energy?',
      options: [
        {
          text: 'It became the carbon atoms that make up the glucose',
          correct: false,
          feedback: 'This is the most common mix-up in the whole topic. The atoms came from CO₂ in the water. Light changes how atoms are arranged. It never becomes atoms.',
        },
        {
          text: 'It was used up and no longer exists anywhere',
          correct: false,
          feedback: 'Energy is never used up. It changes form. Here it went from light into chemical energy.',
        },
        {
          text: 'It became chemical energy in glucose and oxygen',
          correct: true,
          feedback: 'Right. Glucose and O₂ together hold more chemical energy than the CO₂ and water they came from. Light paid the difference.',
        },
      ],
    },
  },
  {
    id: 'grazing',
    short: 'Urchin eats',
    title: 'A sea urchin eats the kelp',
    where: 'Gut, then body fluid, of a purple sea urchin',
    molecule: 'Laminarin, then glucose',
    carbonForm: 'organic',
    paragraphs: [
      'A purple sea urchin grazes on the kelp. Its jaw, called Aristotle\'s lantern, has five teeth that scrape off pieces of blade.',
      'In the urchin\'s gut, enzymes cut laminarin back into single glucose units. Each cut uses one water molecule, so it is called hydrolysis.',
      'The glucose crosses the gut wall into the urchin\'s body fluid. Your carbon atom is still in that glucose. Eating moved the atom. It did not destroy it.',
    ],
    equation: {
      reactants: [
        { coef: 1, species: SPECIES.GLUCOSE_UNIT },
        { coef: 1, species: SPECIES.H2O },
      ],
      products: [{ coef: 1, species: SPECIES.GLUCOSE }],
      words: 'one glucose unit of laminarin + water → glucose',
      energyNote: 'enzymes speed it up',
    },
    energyIn: 'Chemical energy in the kelp the urchin eats',
    energyOut: 'Most stays in glucose. Some passes out in waste.',
    check: {
      question: 'What happens to your carbon atom when the urchin digests the kelp?',
      options: [
        {
          text: 'It stays in glucose that the urchin absorbs into its body',
          correct: true,
          feedback: 'Right. Digestion breaks big molecules into small ones. Every atom is still there, now inside the urchin.',
        },
        {
          text: 'It is broken down into energy that the urchin can use',
          correct: false,
          feedback: 'Food does give the urchin energy, so this sounds right. But the energy comes from rearranging atoms, not destroying them. The atom is still there after digestion.',
        },
        {
          text: 'It is destroyed along with the kelp cells it was part of',
          correct: false,
          feedback: 'The kelp cells are destroyed, but their atoms are not. Count the atoms in the equation: the same atoms are on both sides.',
        },
      ],
    },
  },
  {
    id: 'respiration',
    short: 'Respiration',
    title: 'Cellular respiration releases the energy',
    where: 'Mitochondrion in a tube-foot muscle cell',
    molecule: 'Glucose, then carbon dioxide (CO₂)',
    carbonForm: 'organic-to-inorganic',
    paragraphs: [
      'A tube foot needs ATP to pull the urchin along. Its cells make ATP by breaking down glucose.',
      'Glucose splits in two in the cytoplasm. The pieces enter a mitochondrion, where your carbon atom leaves as part of CO₂.',
      'Here is where most people go wrong. Breaking a bond does not release energy. Breaking a bond always takes energy.',
      'Energy is released because the new bonds in CO₂ and water are stronger. So the products hold less chemical energy than glucose and O₂ did. About a third of the difference is captured in ATP. The rest becomes heat.',
      'One more surprise: the two oxygen atoms in your CO₂ came from glucose and water. The O₂ the urchin takes in ends up in water.',
    ],
    equation: {
      reactants: [
        { coef: 1, species: SPECIES.GLUCOSE },
        { coef: 6, species: SPECIES.O2 },
      ],
      products: [
        { coef: 6, species: SPECIES.CO2 },
        { coef: 6, species: SPECIES.H2O },
      ],
      words: 'glucose + oxygen → carbon dioxide + water',
      energyNote: 'energy out: ATP and heat',
    },
    energyIn: 'Chemical energy in glucose and O₂',
    energyOut: 'About ⅓ captured in ATP, about ⅔ lost as heat',
    check: {
      question: 'Where does the energy released in cellular respiration come from?',
      options: [
        {
          text: 'Breaking the bonds in glucose, which lets out the energy inside them',
          correct: false,
          feedback: 'Most textbooks talk this way, so this is a very common answer. But breaking any bond takes energy in. The payoff comes when stronger new bonds form.',
        },
        {
          text: 'The carbon atoms, which turn into energy as glucose breaks down',
          correct: false,
          feedback: 'Atoms do not turn into energy in any living thing. Your carbon atom is still there afterwards, now in CO₂.',
        },
        {
          text: 'Forming new bonds in CO₂ and water that are stronger than the old ones',
          correct: true,
          feedback: 'Right. Stronger bonds mean the products hold less chemical energy. The difference is released as ATP and heat.',
        },
      ],
    },
  },
  {
    id: 'return',
    short: 'Back to sea',
    title: 'Your carbon atom returns to the sea',
    where: 'Seawater beside the urchin',
    molecule: 'CO₂, then bicarbonate (HCO₃⁻)',
    carbonForm: 'inorganic',
    paragraphs: [
      'CO₂ builds up inside the urchin\'s cells. It diffuses out through the thin walls of the tube feet and gills, from high concentration to low.',
      'In seawater, most of that CO₂ reacts with water and becomes bicarbonate.',
      'Your carbon atom is back where it started. A kelp blade can take it in again. The energy it once carried in glucose is gone, released as heat.',
    ],
    equation: {
      reactants: [
        { coef: 1, species: SPECIES.CO2 },
        { coef: 1, species: SPECIES.H2O },
      ],
      products: [
        { coef: 1, species: SPECIES.HCO3 },
        { coef: 1, species: SPECIES.H },
      ],
      words: 'carbon dioxide + water → bicarbonate + hydrogen ion',
      reversible: true,
    },
    energyIn: 'None. CO₂ carries no usable energy for living things.',
    energyOut: 'The glucose energy already left as heat',
    check: {
      question: 'Your carbon atom is back in seawater. What about the energy it carried in glucose?',
      options: [
        {
          text: 'It returns to the kelp along with the carbon atom',
          correct: false,
          feedback: 'The atom comes back, so it seems the energy should too. But the energy left as heat during respiration. Heat spreads out into the ocean and no organism can reuse it.',
        },
        {
          text: 'It left as heat, and the kelp cannot use it again',
          correct: true,
          feedback: 'Right. Matter cycles. Energy flows through once and leaves as heat.',
        },
        {
          text: 'It stays stored in the CO₂ until the kelp uses it',
          correct: false,
          feedback: 'CO₂ is the low-energy end of the trip. To build sugar from it again, the kelp needs fresh light energy.',
        },
      ],
    },
  },
  {
    id: 'big-picture',
    short: 'Big picture',
    title: 'Matter cycles. Energy flows.',
    where: 'The whole kelp forest',
    molecule: 'Bicarbonate, ready to start again',
    carbonForm: 'inorganic',
    paragraphs: [
      'Your atom went around a loop: seawater, kelp, urchin, seawater. The same atom can make that trip again and again.',
      'Energy took a one-way trip: sunlight in, heat out. That is why every ecosystem needs a steady supply of energy, but not a steady supply of new atoms.',
      'In every step, the atoms were rearranged. None were made, destroyed or turned into energy.',
    ],
    energyIn: 'Sunlight, every day',
    energyOut: 'Heat, every day',
    check: {
      question: 'Why does a kelp forest need new sunlight every day but not new carbon atoms?',
      options: [
        {
          text: 'Kelp turns sunlight into carbon atoms, so it makes new carbon daily',
          correct: false,
          feedback: 'Light never becomes atoms. The kelp gets every carbon atom from the water around it.',
        },
        {
          text: 'Carbon atoms are recycled, but energy leaves as heat and must be replaced',
          correct: true,
          feedback: 'Right. Atoms go round and round. Energy passes through once.',
        },
        {
          text: 'Energy is recycled like carbon, but kelp needs more as the forest grows',
          correct: false,
          feedback: 'Growth does need energy, so this sounds reasonable. But energy is not recycled. A forest that stopped growing would still need sunlight every day.',
        },
      ],
    },
  },
];

/** Count each element on one side of an equation. */
export function tally(terms: Term[]): Record<Element, number> {
  const total: Record<Element, number> = { C: 0, H: 0, O: 0 };
  for (const t of terms) {
    for (const [el, n] of Object.entries(t.species.atoms) as Array<[Element, number]>) {
      total[el] += t.coef * n;
    }
  }
  return total;
}
