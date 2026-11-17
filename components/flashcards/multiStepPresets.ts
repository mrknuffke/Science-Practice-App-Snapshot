import { Flashcard } from '../../types';

export const MULTI_STEP_PRESETS: Flashcard[] = [
  {
    id: 'ms_bio_action_potential',
    type: 'multi_step',
    term: 'Action Potential Propagation Mechanism',
    definition: 'Four-stage depolarization and repolarization cycle governing neuronal electrical conduction.',
    context: 'AP Biology: Neurobiology & Cell Signaling',
    multiStepSteps: [
      {
        stepNumber: 1,
        title: 'Resting State & Threshold Stimulus',
        description: 'Membrane maintains resting potential (-70 mV) via Na+/K+ ATPase pump. Initial excitatory stimulus depolarizes membrane toward the -55 mV threshold.',
      },
      {
        stepNumber: 2,
        title: 'Rapid Depolarization (Na+ Influx)',
        description: 'Reaching threshold triggers opening of voltage-gated sodium channels. Rapid influx of Na+ ions shifts membrane potential positive to +30 mV.',
      },
      {
        stepNumber: 3,
        title: 'Repolarization (K+ Efflux)',
        description: 'Voltage-gated sodium channels inactivate. Voltage-gated potassium channels open, allowing massive K+ efflux down its gradient to bring potential back down.',
      },
      {
        stepNumber: 4,
        title: 'Hyperpolarization & Refractory Recovery',
        description: 'Slow closure of K+ channels creates transient undershoot (-80 mV). The Na+/K+ pump restores resting ion distribution during the refractory period.',
      },
    ],
  },
  {
    id: 'ms_bio_translation_cycle',
    type: 'multi_step',
    term: 'Translation Elongation Cycle',
    definition: 'Three-step cyclical addition of amino acids to the nascent polypeptide chain on the ribosome.',
    context: 'AP Biology: Gene Expression & Protein Synthesis',
    multiStepSteps: [
      {
        stepNumber: 1,
        title: 'Codon Recognition at the A Site',
        description: 'An incoming aminoacyl-tRNA paired with elongation factor Tu (EF-Tu) binds to the vacant ribosomal A site matching the mRNA codon via anticodon base-pairing.',
      },
      {
        stepNumber: 2,
        title: 'Peptide Bond Formation',
        description: 'Peptidyl transferase (ribozyme within large subunit) catalyzes peptide bond formation between the P-site amino acid and the new A-site amino acid.',
      },
      {
        stepNumber: 3,
        title: 'Ribosome Translocation (5\' to 3\')',
        description: 'Elongation factor G (EF-G) utilizes GTP hydrolysis to shift the ribosome one codon forward: uncharged tRNA shifts to E site to exit, and peptidyl-tRNA shifts to P site.',
      },
    ],
  },
  {
    id: 'ms_bio_light_reactions',
    type: 'multi_step',
    term: 'Non-Cyclic Photophosphorylation (Z-Scheme)',
    definition: 'Four sequential electron transfer stages in the thylakoid membrane generating ATP and NADPH.',
    context: 'AP Biology: Photosynthesis & Energy Transfer',
    multiStepSteps: [
      {
        stepNumber: 1,
        title: 'Photosystem II Photon Excitation & Photolysis',
        description: 'Light photons excite P680 reaction center. Water-splitting enzyme oxidizes H2O into 2 H+, 1/2 O2, and replacement electrons.',
      },
      {
        stepNumber: 2,
        title: 'Cytochrome b6f Electron Transport & Chemiosmosis',
        description: 'High-energy electrons travel through plastoquinone and Cytochrome b6f, pumping protons into the thylakoid lumen to create a proton motive force.',
      },
      {
        stepNumber: 3,
        title: 'Photosystem I Photoexcitation',
        description: 'Electrons arrive at P700 in Photosystem I and are re-energized by a second absorbed photon, passing through ferredoxin.',
      },
      {
        stepNumber: 4,
        title: 'NADP+ Reduction & ATP Synthesis',
        description: 'NADP+ reductase transfers electrons to NADP+ to form NADPH in the stroma. Accumulated lumen protons power ATP synthase to phosphorylate ADP.',
      },
    ],
  },
  {
    id: 'ms_chem_sn2_mechanism',
    type: 'multi_step',
    term: 'SN2 Nucleophilic Substitution Mechanism',
    definition: 'Concerted bimolecular substitution with stereochemical inversion at an sp3 carbon center.',
    context: 'AP Chemistry / Organic Chemistry: Reaction Mechanisms',
    multiStepSteps: [
      {
        stepNumber: 1,
        title: 'Backside Nucleophilic Attack',
        description: 'Strong nucleophile attacks the electrophilic carbon from 180 degrees opposite the carbon-leaving group bond (minimizing electron repulsion).',
      },
      {
        stepNumber: 2,
        title: 'Pentacoordinate Transition State',
        description: 'High-energy activated complex forms with partial nucleophile-carbon bond formation and simultaneous partial carbon-leaving group bond cleavage.',
      },
      {
        stepNumber: 3,
        title: 'Leaving Group Departure & Walden Inversion',
        description: 'Leaving group departs with electron pair. The three non-reacting substituent bonds flip like an umbrella, yielding 100% stereochemical inversion.',
      },
    ],
  },
  {
    id: 'ms_chem_ozone_catalytic_cycle',
    type: 'multi_step',
    term: 'Catalytic Stratospheric Ozone Depletion',
    definition: 'Free-radical chain reaction cycle where a single chlorine radical decomposes up to 100,000 ozone molecules.',
    context: 'AP Environmental Science / Chemistry: Atmospheric Chemistry',
    multiStepSteps: [
      {
        stepNumber: 1,
        title: 'UV Photodissociation of CFCs',
        description: 'High-energy solar UV-C radiation cleaves carbon-chlorine bond in chlorofluorocarbons (CFCl3 + UV -> CFCl2 + Cl*), releasing free reactive chlorine radicals.',
      },
      {
        stepNumber: 2,
        title: 'Ozone Attack & Chlorine Monoxide Formation',
        description: 'Chlorine radical reacts with stratospheric ozone: Cl* + O3 -> ClO* + O2, destroying the ozone molecule and forming chlorine monoxide intermediate.',
      },
      {
        stepNumber: 3,
        title: 'Catalyst Regeneration via Monatomic Oxygen',
        description: 'Chlorine monoxide reacts with free oxygen atom: ClO* + O -> Cl* + O2. The chlorine radical is regenerated unchanged to repeat the catalytic destruction cycle.',
      },
    ],
  },
];

export interface MultiStepDeckPreset {
  id: string;
  title: string;
  course: string;
  topic: string;
  cards: Flashcard[];
}

export const MULTI_STEP_DECK_PRESETS: MultiStepDeckPreset[] = [
  {
    id: 'preset_biochemical_pathways',
    title: 'Biochemical & Cellular Reaction Pathways',
    course: 'AP Biology',
    topic: 'Sequential Molecular Pathways',
    cards: MULTI_STEP_PRESETS.filter((c) => c.id.startsWith('ms_bio')),
  },
  {
    id: 'preset_chem_reaction_mechanisms',
    title: 'Reaction Mechanisms & Catalytic Cycles',
    course: 'AP Chemistry',
    topic: 'Chemical Reaction Mechanisms',
    cards: MULTI_STEP_PRESETS.filter((c) => c.id.startsWith('ms_chem')),
  },
];
