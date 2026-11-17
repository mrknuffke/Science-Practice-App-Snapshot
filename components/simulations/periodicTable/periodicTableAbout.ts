import { SimulationAboutContent } from '../shared/AboutPanel';

export const PERIODIC_TABLE_ABOUT: SimulationAboutContent = {
  title: 'Interactive Periodic Table',
  summary:
    'Explore all 118 elements, visualize periodic trends, compare elements side-by-side, and see how state changes with temperature. Click any element to inspect its details.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Each cell displays an element\'s <strong>atomic number</strong>, <strong>symbol</strong>, <strong>name</strong>, and <strong>atomic mass</strong>.',
        'Colors reflect the element\'s <strong>category</strong> (alkali metals, halogens, noble gases, etc.) by default.',
        'The <strong>f-block</strong> (lanthanides and actinides) appears below the main table. Toggle it on or off in the controls.',
        'Click any element to open its <strong>detail card</strong> on the right side.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Search:</strong> Type an element name or symbol to highlight and jump directly to it.',
        '<strong>Category filter:</strong> Click a category button to dim other elements and focus on that group.',
        '<strong>Standard view:</strong> Default color-coded layout by element family.',
        '<strong>Temperature view:</strong> Drag the temperature slider (in Kelvin) to see which elements are solid, liquid, or gas at that temperature.',
        '<strong>Property view:</strong> Select a property (such as atomic radius, electronegativity, or ionization energy) to shade the table on a dedicated color gradient.',
        '<strong>Graph view:</strong> Plots properties as scatter plots across groups and periods to reveal periodic trends directly.',
        '<strong>Print view:</strong> Clean, printer-friendly layout with customizable data fields.',
        'In the <strong>detail card:</strong> Switch between Bohr model, Lewis dot diagram, and Spectra tabs, inspect electron configurations, and pick a comparison element.',
        'The <strong>Spectra tab:</strong> Displays visible-light emission and absorption lines (380 to 700 nm). The bright emission lines match dark absorption lines at the exact same wavelengths because both stem from identical electron transitions.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Metallic vs. nonmetallic character:</strong> Switch to Property view and compare Metallic vs Non-Metallic Character. Notice how metallic character peaks at bottom-left (Francium/Cesium) while nonmetallic character peaks at top-right (Fluorine).',
        '<strong>Opposing reactivity trends:</strong> In Graph view, plot Metal Reactivity for Group 1 (increases going down) and Non-Metal Reactivity for Group 17 (increases going up). Why do metals and nonmetals behave oppositely?',
        '<strong>Visualize electronegativity:</strong> Switch to Property view and select Electronegativity. Notice how attraction for shared electrons spikes toward the top-right corner.',
        '<strong>Temperature tour:</strong> In Temperature view, start at 0 K and drag the slider up. Watch elements melt and boil. At what temperature does iron melt?',
        '<strong>Noble gas electron shells:</strong> Click each noble gas and expand its electron configuration. Notice how each one completes a shell: the foundation for periodic stability.',
        '<strong>Compare two transition metals:</strong> Click iron (Fe), then add copper (Cu) as a comparison to inspect density, ionization energy, and configurations side by side.',
        '<strong>Halogen family:</strong> Filter by "Halogens" and click each one. How do radius and reactivity change as you move down the column?',
        '<strong>Find the metalloids:</strong> Filter by "Metalloids" to highlight the staircase elements that bridge metallic conductors and nonmetal insulators.',
        '<strong>Graph atomic radius across Period 2:</strong> Switch to Graph view and trace radius from Li to Ne. Why does the atom shrink even though atomic number increases?',
        '<strong>Hydrogen vs. neon spectra:</strong> Open Hydrogen\'s Spectra tab and count its 4 clean Balmer lines. Then check Neon to see the dense forest of red-orange lines that makes neon signs glow.',
        '<strong>Find sodium\'s D-line:</strong> Open Sodium\'s Spectra tab and zoom near 589 nm to see the doublet responsible for yellow streetlights and flame tests.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Periodic trends:</strong> Atomic radius, electronegativity, and ionization energy change predictably due to effective nuclear charge and electron shielding.',
        '<strong>Metallic character:</strong> An element\'s tendency to lose valence electrons and form positive ions (cations); increases down groups and toward the left.',
        '<strong>Non-metallic character:</strong> An element\'s tendency to gain or share electrons to form anions or covalent bonds; increases up groups and toward the right.',
        '<strong>Metal reactivity:</strong> How readily a metal loses electrons, governed by low ionization energy (Cesium/Francium most reactive, Gold/Platinum least reactive).',
        '<strong>Non-metal reactivity:</strong> How readily a nonmetal attracts electrons, governed by high electronegativity (Fluorine most reactive, noble gases inert).',
        '<strong>Electron configuration:</strong> The arrangement of electrons in shells and subshells, determining chemical bonding behavior.',
        '<strong>Bohr model:</strong> Simplified planetary model showing electrons occupying discrete energy levels around the nucleus.',
        '<strong>Lewis dot diagram:</strong> Represents valence electrons as dots around the chemical symbol to predict covalent and ionic bonding.',
        '<strong>Phase changes:</strong> Every element has characteristic melting and boiling points dictated by the strength of its atomic or metallic bonding.',
        '<strong>Emission spectrum:</strong> Bright lines released when excited electrons drop to lower energy levels, emitting photons of exact wavelengths.',
        '<strong>Absorption spectrum:</strong> Dark lines produced when ground-state electrons absorb photons of matching energy to jump to higher levels.',
      ],
    },
  ],
};
