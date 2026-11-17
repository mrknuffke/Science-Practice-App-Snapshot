import { ChallengeDef } from '../shared/ChallengeDeck';
import { ParticleType } from '../../../types';

export interface DiffusionSolutionProtein {
  type: 'channel' | 'pump';
  allowedParticle: ParticleType;
  pumpDirection?: 'in' | 'out';
}

export interface DiffusionChallenge extends ChallengeDef {
  initialSetup: {
    oxygenExt: number;
    oxygenInt: number;
    glucoseExt: number;
    glucoseInt: number;
    sodiumExt: number;
    sodiumInt: number;
  };
  solutionProteins?: DiffusionSolutionProtein[];
}

export const DIFFUSION_CHALLENGES: DiffusionChallenge[] = [
  {
    id: 'passive_diffusion',
    title: 'Passive Bilayer Diffusion',
    description: 'Establish dynamic equilibrium for oxygen across the membrane without adding any transport proteins. Let random kinetic motion balance oxygen between the inside and outside.',
    hints: [
      'Where is oxygen concentrated initially, and what happens to net flux as concentrations level out?',
      'Small nonpolar molecules dissolve directly through the hydrophobic core of the phospholipid bilayer without transport proteins.',
      'Press Play and let the particles diffuse until oxygen concentrations balance on both sides.',
    ],
    solution: 'Allow passive diffusion to proceed until oxygen concentrations equilibrate across the membrane (|Outside - Inside| <= 3).',
    initialSetup: {
      oxygenExt: 30,
      oxygenInt: 0,
      glucoseExt: 10,
      glucoseInt: 0,
      sodiumExt: 10,
      sodiumInt: 0,
    },
    solutionProteins: [],
  },
  {
    id: 'facilitated_glucose',
    title: 'Facilitated Diffusion (Glucose Channel)',
    description: 'Bring at least 10 glucose molecules into the cell down their concentration gradient without using ATP.',
    hints: [
      'Why can small oxygen molecules slip through the lipid bilayer while large glucose molecules bounce off?',
      'Large, polar molecules need transmembrane channel proteins to facilitate passive diffusion down their concentration gradient.',
      'Add a Glucose Channel to the membrane and run the simulation to let glucose enter the cell.',
    ],
    solution: 'Deploy a Glucose Channel into the bilayer and let facilitated diffusion bring glucose inside.',
    initialSetup: {
      oxygenExt: 10,
      oxygenInt: 10,
      glucoseExt: 25,
      glucoseInt: 0,
      sodiumExt: 10,
      sodiumInt: 0,
    },
    solutionProteins: [
      { type: 'channel', allowedParticle: 'glucose' },
    ],
  },
  {
    id: 'active_sodium',
    title: 'Active Transport Against Gradient',
    description: 'Pump sodium ions outward against their concentration gradient until at least 25 sodium ions accumulate outside the cell.',
    hints: [
      'Which way is the sodium gradient pointing, and can passive transport push ions uphill against it?',
      'Moving solutes against their concentration gradient requires active transport powered by ATP.',
      'Add a Sodium Pump, make sure it points Outward, and click Supply ATP (or press Space) to pump sodium ions out.',
    ],
    solution: 'Deploy a Sodium Pump and supply ATP to power outward active transport until extracellular sodium >= 25.',
    initialSetup: {
      oxygenExt: 10,
      oxygenInt: 10,
      glucoseExt: 10,
      glucoseInt: 10,
      sodiumExt: 15,
      sodiumInt: 20,
    },
    solutionProteins: [
      { type: 'pump', allowedParticle: 'sodium', pumpDirection: 'out' },
    ],
  },
  {
    id: 'homeostasis',
    title: 'Cellular Membrane Homeostasis',
    description: 'Coordinate multiple transport pathways at once: bring at least 8 glucose molecules into the cell using a channel protein while keeping oxygen balanced on both sides.',
    hints: [
      'How do real cells run nutrient uptake and gas exchange at the same time?',
      'Different transport mechanisms operate independently: oxygen diffuses directly through the lipids while glucose flows through its protein channel.',
      'Add a Glucose Channel, keep the simulation running, and observe how oxygen and glucose equilibrate side by side.',
    ],
    solution: 'Deploy a Glucose Channel and a Sodium transport protein, running until glucose enters and oxygen equilibrates.',
    initialSetup: {
      oxygenExt: 20,
      oxygenInt: 5,
      glucoseExt: 25,
      glucoseInt: 0,
      sodiumExt: 15,
      sodiumInt: 15,
    },
    solutionProteins: [
      { type: 'channel', allowedParticle: 'glucose' },
      { type: 'channel', allowedParticle: 'sodium' },
    ],
  },
];
