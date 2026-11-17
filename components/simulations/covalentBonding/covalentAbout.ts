import { SimulationAboutContent } from '../shared/AboutPanel';

export const COVALENT_ABOUT: SimulationAboutContent = {
  title: 'Covalent Bonding Builder',
  summary:
    'Build molecules atom by atom. Watch electron sharing, lone pairs, formal charges, and 3D molecular shapes emerge directly as you connect atoms with single, double, and triple bonds.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'The main canvas displays atoms as <strong>overlapping colored circles</strong>. The overlapping zone represents shared valence electrons (the covalent bond).',
        'Beside or beneath the canvas, the <strong>dot-cross diagram</strong> gives you a classic Lewis structure showing valence electron distributions.',
        'The inspector panel tracks the <strong>molecular formula</strong>, <strong>formal charges</strong>, <strong>electron domain geometry</strong>, and <strong>molecular geometry</strong> predicted by VSEPR theory.',
        'Each element follows standard CPK coloring: hydrogen is white, carbon is dark gray, nitrogen is blue, and oxygen is red.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Build a Molecule',
      bullets: true,
      items: [
        '<strong>1. Pick an element</strong> from the palette (such as H, C, N, O, or F) to begin.',
        '<strong>2. Click on the canvas</strong> to place the atom. The first atom you drop becomes the central atom.',
        '<strong>3. Choose a bond tool</strong> (Single, Double, or Triple) from the right-hand panel.',
        '<strong>4. Click two atoms</strong> in turn to link them with that bond.',
        '<strong>5. Clean up</strong> using the Break Bond tool or select an atom to delete it.',
        '<strong>Preset library:</strong> Load common molecules like water, carbon dioxide, methane, ammonia, or benzene whenever you want a quick starting point.',
        '<strong>Clear:</strong> Hit Clear to wipe the canvas and start a new structure.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Build water (H₂O).</strong> Drop an oxygen atom, add two hydrogen atoms, and connect each with a single bond. Notice how oxygen keeps two non-bonding lone pairs, squeezing the bond angle into a bent shape.',
        '<strong>Compare CO₂ vs. SO₂.</strong> Both molecules have two oxygen atoms bonded to a central atom, but their 3D shapes are completely different. Carbon dioxide is linear because carbon has no lone pairs, while sulfur dioxide is bent because sulfur holds an extra lone pair. Build both and compare.',
        '<strong>Test bond order effects.</strong> Build ethene (C₂H₄) with a central double bond, then build ethyne (C₂H₂) with a triple bond. Observe how adding shared electron pairs changes the geometry around each carbon.',
        '<strong>Compare methane and ammonia.</strong> Build CH₄ (tetrahedral, four bonding pairs) and compare it to NH₃ (trigonal pyramidal, three bonding pairs and one lone pair). See how a lone pair repels more strongly than a bond.',
        '<strong>Check formal charges on carbon monoxide.</strong> Build CO with a triple bond. Examine the formal charges: why does oxygen carry a positive formal charge while carbon carries a negative one?',
        '<strong>Examine an expanded octet.</strong> Build sulfur hexafluoride (SF₆). Sulfur is in Period 3, so its accessible d-orbitals allow it to hold 12 shared electrons in an octahedral arrangement.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Covalent bonds:</strong> Stable connections formed when nonmetal atoms share valence electron pairs (2 electrons in a single bond, 4 in a double bond, 6 in a triple bond).',
        '<strong>Lone pairs:</strong> Valence electrons localized on a single atom that do not participate in bonding. Their localized electron cloud exerts stronger electrostatic repulsion than shared bonding pairs.',
        '<strong>VSEPR theory:</strong> Valence Shell Electron Pair Repulsion theory states that electron domains around a central atom push as far apart as possible to minimize repulsive forces, dictating molecular shape.',
        '<strong>Formal charge:</strong> The bookkeeping charge an atom would have if all shared electrons were divided equally: Valence Electrons - Nonbonding Electrons - (Shared Electrons / 2).',
        '<strong>Molecular polarity:</strong> A molecule is polar when individual bond dipoles do not cancel out symmetrically, leaving a net dipole moment across the structure.',
      ],
    },
  ],
};
