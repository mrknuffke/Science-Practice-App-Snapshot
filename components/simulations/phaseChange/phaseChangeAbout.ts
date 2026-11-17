import { SimulationAboutContent } from '../shared/AboutPanel';

export const PHASE_CHANGE_ABOUT: SimulationAboutContent = {
  title: 'Particle Phase Change Simulator',
  summary:
    'Explore how adding or removing thermal energy changes states of matter through kinetic molecular theory. Watch particles vibrate, flow, or disperse while tracking temperature plateaus on the heating curve.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'The main chamber contains particles of your chosen substance vibrating in a crystal lattice (solid), flowing over one another (liquid), or flying freely through the container (gas).',
        'The <strong>Heating Curve</strong> graph plots temperature against accumulated heat energy, highlighting where latent heat causes temperature plateaus.',
        'The particle counters show the real-time breakdown of particles in the solid, liquid, and gas phases.',
        'The heater/cooler bucket beneath the vessel lets you add or remove thermal energy continuously.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Add Heat:</strong> Hold or click the Heat button to pump thermal energy into the vessel.',
        '<strong>Remove Heat:</strong> Use the Cool button to extract energy and cool the particles down toward absolute zero.',
        '<strong>Change Substance:</strong> Switch between Water, Neon, Oxygen, and Carbon Dioxide to compare how molecular structure and intermolecular forces govern melting and boiling points.',
        '<strong>Take on Challenges:</strong> Click Challenge Mode to practice catching melting plateaus, boiling transitions, and dry ice sublimation.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Catch the water melting plateau:</strong> Heat solid ice up to 273 K (0 °C). Notice how temperature stops rising while the lattice breaks apart: all added energy goes into overcoming intermolecular hydrogen bonds.',
        '<strong>Compare Neon to Water:</strong> Neon is held together only by very weak London dispersion forces. Look at how low its melting and boiling points are compared to polar water.',
        '<strong>Observe dry ice sublimation:</strong> Select Carbon Dioxide and heat it from cold. Notice that at 1 atmosphere of pressure, liquid CO₂ never forms: particles break directly out of the solid crystal into gas.',
        '<strong>Track the boiling plateau:</strong> Heat liquid water to 373 K (100 °C). Watch how long the temperature stays flat while liquid converts to vapor, reflecting water\'s large enthalpy of vaporization.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Kinetic energy and temperature:</strong> Temperature directly measures the average kinetic energy of the particles. Higher temperatures mean faster particle vibration and translation.',
        '<strong>Intermolecular forces:</strong> Attractions between particles draw them together into lattices or liquid droplets. The balance between thermal kinetic energy and intermolecular attraction dictates the state of matter.',
        '<strong>Latent heat plateaus:</strong> During a phase transition (melting or boiling), added energy breaks intermolecular bonds rather than increasing particle speed, keeping temperature constant.',
        '<strong>Sublimation:</strong> Direct phase change from solid to gas occurring when atmospheric pressure is below a substance\'s triple point, as with dry ice at standard room pressure.',
      ],
    },
  ],
};
