import { SimulationAboutContent } from '../shared/AboutPanel';

export const KINETICS_ABOUT: SimulationAboutContent = {
  title: 'Reaction Kinetics',
  summary:
    'Explore how temperature, reactant concentration, and catalysts control the speed of chemical reactions and biological enzymes, modeled through colliding particles that must clear an activation energy threshold.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Chemistry mode:</strong> Red reactant particles (A) and blue reactant particles (B) bounce inside a sealed vessel. When they collide with sufficient kinetic energy, they form a purple product molecule (C).',
        '<strong>Biology mode:</strong> Red substrate molecules (S) collide with large amber enzyme proteins (E). When captured, they briefly form an enzyme-substrate complex before releasing a green product (P).',
        '<strong>Glowing particles:</strong> Particles with halos are moving fast enough to clear the activation energy barrier. Only collisions involving these energetic particles can react.',
        'The <strong>Reaction Progress graph</strong> tracks reactant depletion and product generation over time.',
        'The <strong>Energy Diagram</strong> panel illustrates the potential energy barrier: the dashed line drops when a catalyst or enzyme provides an alternate reaction pathway.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Chemistry / Biology toggle:</strong> Switch between inorganic bimolecular collisions and enzyme-catalyzed biochemistry.',
        '<strong>Temperature:</strong> Adjust the thermal slider to speed up or slow down particles. Notice how higher temperatures increase both collision frequency and the fraction of collisions exceeding Eₐ.',
        '<strong>Add Catalyst / Enzyme:</strong> Introduces a catalytic mechanism that lowers the required activation energy without being consumed.',
        '<strong>Add Reactants:</strong> Injects additional reactant or substrate particles to test the effect of concentration on reaction velocity.',
        '<strong>Reset:</strong> Clears accumulated products and resets particle concentrations for a new trial run.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Test collision energy:</strong> Start cold: particles bounce off each other harmlessly. Slowly increase temperature and note the threshold where product molecules begin to form.',
        '<strong>Add a catalyst at low temperature:</strong> Notice how dropping the activation energy barrier allows even slowly moving particles to react.',
        '<strong>Observe enzyme saturation:</strong> In Biology mode, add dozens of substrate molecules while keeping enzyme count constant. Watch reaction speed hit an upper limit (Vmax) because every active site is continuously occupied.',
        '<strong>Trigger enzyme denaturation:</strong> In Biology mode, crank the temperature to maximum heat. The enzyme unfolds, loses its active site geometry, and reaction halts completely.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Collision theory:</strong> Chemical reactions occur only when reactant particles collide with sufficient energy (greater than or equal to Eₐ) and favorable spatial orientation.',
        '<strong>Activation energy (Eₐ):</strong> The minimum energy barrier required to reach the transition state where original bonds distort and new bonds begin forming.',
        '<strong>Catalysts & enzymes:</strong> Catalysts provide alternative transition states with lower activation energy barriers, accelerating rates without shifting overall thermodynamic equilibrium.',
        '<strong>Maxwell-Boltzmann distribution:</strong> At any temperature, particles exhibit a spread of velocities; raising temperature broadens this curve so an exponentially larger fraction clears the activation threshold.',
      ],
    },
  ],
};
