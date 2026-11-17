import { SimulationAboutContent } from '../shared/AboutPanel';

export const GAS_LAWS_ABOUT: SimulationAboutContent = {
  title: 'Ideal Gas Laws',
  summary:
    'Change pressure, volume, temperature, and particle count to discover how gas laws emerge directly from particle collisions.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'The <strong>rectangular vessel</strong> holds bouncing ideal-gas particles. The walls exert no attraction.',
        '<strong>Gas A (larger circles):</strong> heavier molecules that contribute partial pressure P<sub>A</sub>.',
        '<strong>Gas B (smaller circles labeled "b"):</strong> lighter molecules that contribute partial pressure P<sub>B</sub>.',
        'Particle <strong>color</strong> shows speed relative to the average: <strong>dark blue is slow/cold</strong>, <strong>bright red is fast/hot</strong>.',
        'The <strong>piston</strong> (top gray bar) is the movable top wall. Drag it down to compress the gas, or up to expand it.',
        '<strong>Temperature (K)</strong> is calculated from the average kinetic energy of the particles, not dialed in by a slider.',
        '<strong>Pressure</strong> measures how hard and how often particles strike the walls: a real collision tally, not a formula.',
        'The <strong>Live Readings graph</strong> tracks T, total pressure, and volume over time. Pick any two variables to plot against each other.',
        'When the <strong>vent is open</strong>, particles escape through the right wall, dropping pressure and particle count together.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Play / Pause:</strong> Start or freeze the simulation.',
        '<strong>Volume slider:</strong> Moves the piston. Drag left to compress, or right to expand.',
        '<strong>Add Heat:</strong> Speeds up particles, raising temperature. The simulation must be running.',
        '<strong>Remove Heat:</strong> Slows down particles, dropping temperature toward absolute zero.',
        '<strong>+10 Gas A:</strong> Adds 10 large molecules, increasing particle count and P<sub>A</sub>.',
        '<strong>+10 Gas B:</strong> Adds 10 small molecules, increasing particle count and P<sub>B</sub>.',
        '<strong>Reset:</strong> Restores default state (30 Gas A molecules at room-temperature speed).',
        '<strong>Open Vent:</strong> Opens a gap in the right wall so gas particles can escape.',
        '<strong>Indestructible:</strong> Disables the pressure-limit break so you can test extreme compression and heating.',
        '<strong>X / Y axis selectors:</strong> Replot the graph as a scatter of any two variables to test gas relationships directly.',
        '<strong>Pressure limit warning:</strong> If pressure gets too high without Indestructible enabled, the container breaks.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Boyle\'s Law (P and V):</strong> Keep temperature constant. Drag the piston down slowly. Watch pressure climb as volume shrinks. Plot Volume vs Pressure to see the inverse curve.',
        '<strong>Reversibility check:</strong> Compress the piston, then pull it back to where you started. Temperature returns to its starting value: a clean round trip.',
        '<strong>Vent the gas:</strong> Open the vent while the simulation runs. Watch pressure and molecule count drop while temperature stays roughly steady.',
        '<strong>Gay-Lussac\'s Law (P and T):</strong> Leave the piston alone to keep volume constant. Click "Add Heat" repeatedly. Watch temperature and pressure climb together.',
        '<strong>Charles\'s Law (V and T):</strong> After heating the gas, expand the piston until pressure returns to 1.0 atm. That gives the new volume at higher temperature.',
        '<strong>Avogadro\'s Law (V and n):</strong> Add Gas A molecules while keeping T and V constant. Watch pressure rise, then expand the piston to equalize pressure.',
        '<strong>Dalton\'s Law of Partial Pressures:</strong> Start with Gas A alone and note the pressure. Add Gas B. Notice how total pressure equals P<sub>A</sub> + P<sub>B</sub>.',
        '<strong>Approach absolute zero:</strong> Click "Remove Heat" many times. Particles slow and turn deep blue as pressure approaches zero.',
        '<strong>Break the vessel:</strong> Compress the piston all the way down, then add heat. What happens when wall collisions become too intense?',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Kinetic Molecular Theory:</strong> Gas pressure comes from particles colliding with container walls. Temperature is average kinetic energy.',
        '<strong>Boyle\'s Law:</strong> At constant T and n, P and V are inversely related. Halve the volume, double the pressure.',
        '<strong>Charles\'s Law:</strong> At constant P and n, volume is proportional to Kelvin temperature. Double absolute temperature, double the volume.',
        '<strong>Gay-Lussac\'s Law:</strong> At constant V and n, pressure is proportional to Kelvin temperature. Double absolute temperature, double the pressure.',
        '<strong>Avogadro\'s Law:</strong> At constant T and P, volume is proportional to particle count. Double the molecules, double the required volume.',
        '<strong>Ideal Gas Law:</strong> All four laws combine into PV = nRT, which emerges naturally from particle collisions.',
        '<strong>Dalton\'s Law:</strong> Total pressure equals the sum of partial pressures exerted by each gas: P<sub>total</sub> = P<sub>A</sub> + P<sub>B</sub>.',
        '<strong>Absolute Zero:</strong> 0 K is the theoretical temperature where particle motion ceases, bringing pressure to zero.',
      ],
    },
  ],
};
