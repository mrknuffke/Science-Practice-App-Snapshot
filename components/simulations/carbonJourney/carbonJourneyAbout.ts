import { SimulationAboutContent } from '../shared/AboutPanel';

export const CARBON_JOURNEY_ABOUT: SimulationAboutContent = {
  title: 'Tracking a Carbon Atom',
  summary:
    'Follow one carbon atom from seawater, into bull kelp, through a purple sea urchin and back to the sea. Along the way, keep two questions apart: where is the atom, and where is the energy? Adapted from an original simulation by Ms. Michelle Lee, SAS General Biology.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Gold atom:</strong> Your carbon atom. It is the same atom in every stage and every view.',
        '<strong>Kelp forest view:</strong> Bull kelp grows from a holdfast on the rock, up a single stipe, to a gas-filled float. Its blades stream from the float. A purple sea urchin grazes on the floor.',
        '<strong>Close-up view:</strong> Zooms in to the cells, molecules or energy changes for the current stage.',
        '<strong>Matter card:</strong> Which molecule holds your atom, and whether it is organic or inorganic.',
        '<strong>Energy card:</strong> Where the energy in this step comes from and where it goes.',
        '<strong>Atom count:</strong> Each equation counts the C, H and O atoms on both sides, so you can see nothing is made or destroyed.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Stage buttons:</strong> Jump to any of the six stages. A tick appears when you solve that stage\'s check.',
        '<strong>Kelp forest or Close-up:</strong> Switch views at any stage. Try both for each stage.',
        '<strong>Back and Next stage:</strong> Step through in order. After the last stage, Follow it again starts the loop over.',
        '<strong>Check your thinking:</strong> Each stage has one question. Every answer, right or wrong, explains itself. Keep trying until you find the right one.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Count the atoms:</strong> In stage 2, check the atom count. 6 C, 12 H and 18 O go in. The same 6 C, 12 H and 18 O come out.',
        '<strong>Follow the oxygen:</strong> In stage 2, the O₂ the kelp gives off comes from split water, not from CO₂. In stage 4, the O₂ the urchin takes in ends up in water.',
        '<strong>Find the energy:</strong> Open the stage 4 close-up. Breaking bonds sends energy in. Forming stronger bonds sends more energy out. The difference is what the urchin gets.',
        '<strong>Compare stages 1 and 5:</strong> The atom is in the same form both times. Look at the energy card to see what changed.',
        '<strong>Build the big picture:</strong> In stage 6, trace the gold loop and the one-way energy arrow. Explain why one is a loop and the other is not.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Conservation of matter:</strong> Chemical reactions rearrange atoms. They never make, destroy or convert atoms into energy.',
        '<strong>Photosynthesis:</strong> Light energy splits water and is captured in ATP and NADPH. The Calvin cycle uses them to build CO₂ into sugar.',
        '<strong>Cellular respiration:</strong> Glucose and O₂ become CO₂ and water. Energy is released because the new bonds are stronger than the old ones. About a third is captured in ATP. The rest becomes heat.',
        '<strong>Organic and inorganic carbon:</strong> Organic carbon sits in molecules built by living things, like glucose. Inorganic carbon sits in CO₂ and bicarbonate.',
        '<strong>Matter cycles, energy flows:</strong> Atoms go around the ecosystem again and again. Energy enters as light and leaves as heat, so it must be supplied every day.',
      ],
    },
  ],
};
