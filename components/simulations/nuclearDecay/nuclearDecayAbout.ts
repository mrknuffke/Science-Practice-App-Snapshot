import { SimulationAboutContent } from '../shared/AboutPanel';

export const NUCLEAR_DECAY_ABOUT: SimulationAboutContent = {
  title: 'Radioactive Decay & Radiometric Dating',
  summary:
    'Think of radioactive decay like rolling a bucket of 100 dice: any die that rolls a 6 decays. Explore how random individual nuclear transmutations produce predictable exponential half-life curves used to date ancient artifacts and rocks.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>100-Nucleus Grid:</strong> A 10x10 lattice of individual atomic nuclei. Brightly colored circles represent undecayed radioactive parent nuclei; slate-gray circles are stable daughter transmutation products.',
        '<strong>Decay Profile Curve:</strong> A plot displaying the exponential decay curve N(t) = N₀ · (1/2)^(t / t½). The indicator marker traces your current position in half-lives.',
        '<strong>Nuclear Transmutation Equation:</strong> Shows the balanced nuclear equation conserving mass number (A) and atomic number (Z), emitting alpha or beta particles.',
        '<strong>Radiometric Dating Calculator:</strong> Enter any measured percentage of parent isotope remaining to solve for elapsed half-lives and absolute sample age.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Select Radioisotope:</strong> Choose between Carbon-14 (5,730 yr, archaeology), Iodine-131 (8.02 days, nuclear medicine), Uranium-238 (4.47 billion years, geochronology), or Cobalt-60 (5.27 yr, radiation therapy).',
        '<strong>Scrub the Half-Life Slider:</strong> Advance from 0.0 to 5.0 half-lives and observe how parent nuclei cut in half with each interval.',
        '<strong>Solve Mystery Artifacts:</strong> Switch on Challenge Mode to date ancient Egyptian tomb timbers, Neanderthal cave charcoal, and early Earth zircon crystals.',
        '<strong>Reset:</strong> Click Reset to return to a fresh sample with 100 undecayed parent nuclei.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Verify the 50% Rule:</strong> Move the slider to exactly 1.00 half-life. Notice that about 50 parent nuclei remain in the grid, regardless of whether the isotope takes days or billions of years to decay.',
        '<strong>Trace successive halvings:</strong> Move to 2.00 half-lives (25% remaining), then 3.00 half-lives (12.5% remaining), and 4.00 half-lives (6.25% remaining). The rate of decay slows down naturally because fewer parent atoms are left to roll.',
        '<strong>Compare timescales:</strong> Compare medical Iodine-131 (t½ = 8 days) with geological Uranium-238 (t½ = 4.47 billion years). The mathematical curve is identical; only the clock units change.',
        '<strong>Check conservation of mass and charge:</strong> Inspect the balanced equation for Uranium-238 alpha decay. Notice that top mass numbers (238 = 234 + 4) and bottom atomic numbers (92 = 90 + 2) balance on both sides.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>First-order kinetics:</strong> Nuclear decay rate depends solely on the number of undecayed parent nuclei remaining: dN/dt = -λN, where the decay constant is λ = ln(2) / t½.',
        '<strong>Half-life invariance:</strong> Unlike chemical reactions, nuclear decay half-lives are immune to changes in temperature, pressure, chemical bonds, or magnetic fields.',
        '<strong>Radiometric dating:</strong> By comparing the fraction of remaining parent isotope to its stable daughter product, scientists determine the absolute age of specimens: t = t½ · log₂(N₀ / N).',
        '<strong>Matching isotope to artifact:</strong> Radiometric dating requires choosing an isotope whose half-life matches the timescale of the sample: Carbon-14 is ideal for organic remains under 50,000 years, while Uranium-238 dates rocks billions of years old.',
      ],
    },
  ],
};
