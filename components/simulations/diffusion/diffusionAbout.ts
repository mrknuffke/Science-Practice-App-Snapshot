import { SimulationAboutContent } from '../shared/AboutPanel';

export const DIFFUSION_ABOUT: SimulationAboutContent = {
  title: 'Cell Membrane Transport',
  summary:
    'Explore how molecules cross the selectively permeable cell membrane through simple passive diffusion, facilitated transport channels, and ATP-powered active pumps.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Top chamber:</strong> Extracellular fluid outside the cell.',
        '<strong>Bottom chamber:</strong> Intracellular cytoplasm inside the cell.',
        'The <strong>horizontal lipid bilayer:</strong> The hydrophobic membrane core that acts as a physical barrier to ions and large polar molecules.',
        '<strong>Oxygen (green, small):</strong> Nonpolar gas molecules that diffuse directly through the lipid bilayer via simple diffusion.',
        '<strong>Glucose (orange, large):</strong> Polar nutrient molecules that cannot penetrate the bilayer without a transmembrane channel protein.',
        '<strong>Sodium (purple, medium):</strong> Charged cations that require an active transport pump powered by ATP to move against a gradient.',
        'The <strong>Concentration Graph:</strong> Plots molecule counts inside and outside the cell in real time.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Play / Pause:</strong> Start or freeze particle kinetic motion.',
        '<strong>Add molecules:</strong> Inject extra solute particles on either side to alter concentration gradients.',
        '<strong>Add Glucose Channel:</strong> Inserts a passive facilitated transport pore, letting glucose flow down its concentration gradient toward equilibrium.',
        '<strong>Add Sodium Pump:</strong> Inserts an ATP-driven transport protein. Click the pump to select it, then click Supply ATP (or press Space) to pump ions.',
        '<strong>Pump direction toggle:</strong> Toggle whether an active pump pushes ions inward or outward across the bilayer.',
        '<strong>Reset:</strong> Clears custom transport proteins and returns particle counts to their default values.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Observe simple diffusion:</strong> Press Play and watch oxygen particles wander across the membrane until concentrations equalize naturally.',
        '<strong>Compare channel-mediated transport:</strong> Insert a Glucose Channel and compare how quickly glucose equilibrates compared to freely diffusing oxygen.',
        '<strong>Build an ion gradient:</strong> Place a Sodium Pump set to Outward, repeatedly supply ATP, and watch sodium accumulate outside the cell against its gradient.',
        '<strong>Test selective permeability:</strong> Notice how glucose molecules bounce off the bare bilayer repeatedly until you provide an open channel protein.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Concentration gradient:</strong> Natural difference in solute concentration between two regions. In passive transport, particles move down this gradient without cellular energy.',
        '<strong>Dynamic equilibrium:</strong> When concentrations balance across a membrane, particle movement does not stop: instead, equal numbers cross in both directions, yielding zero net flux.',
        '<strong>Selective permeability:</strong> The phospholipid bilayer allows small nonpolar molecules (like O₂ and CO₂) to pass directly, while blocking ions and large polar solutes.',
        '<strong>Facilitated diffusion:</strong> Passive transport through membrane channels or carriers down a concentration gradient without expenditure of ATP.',
        '<strong>Active transport:</strong> Protein pumps consume cellular metabolic energy (ATP) to drive solutes against their electrochemical gradient, maintaining necessary ion imbalances.',
      ],
    },
  ],
};
