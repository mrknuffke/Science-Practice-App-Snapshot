import { SimulationAboutContent } from '../shared/AboutPanel';

export const IONIC_ABOUT: SimulationAboutContent = {
  title: 'Ionic Bonding Builder',
  summary:
    'Build ionic compounds by transferring valence electrons from metals to nonmetals. Watch charges balance, explore crystal lattice arrangements, and verify the resulting IUPAC name and formula mass.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Left panel:</strong> Element selection palette. Pick a metal (cation donor) and a nonmetal or polyatomic ion (anion acceptor).',
        'The <strong>Lewis Transfer Diagram</strong> shows valence electrons leaping from the metal atom into the nonmetal valence shell, completing octets.',
        'The <strong>Crystal Lattice</strong> view displays the repeating 3D alternating network of cations and anions held by electrostatic attraction.',
        'The <strong>Bohr Model</strong> tab maps concentric electron shells before and after the electron transfer occurs.',
        'The <strong>Bracket Notation</strong> panel formats the formal ionic compound with bracketed charges and whole-number stoichiometric subscripts.',
        'The <strong>Inspector panel</strong> calculates IUPAC nomenclature, formula mass, and bonding characteristics in real time.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Build a Compound',
      bullets: true,
      items: [
        '<strong>Metals (Cations):</strong> Select alkali metals, alkaline earth metals, aluminum, zinc, silver, or transition metals like iron and copper with multiple oxidation states.',
        '<strong>Nonmetals (Anions):</strong> Select halogens or Group 15-16 nonmetals to add them directly to the canvas.',
        '<strong>Polyatomic Ions:</strong> Switch to Ternary mode to work with common polyatomic units like hydroxide, nitrate, sulfate, carbonate, phosphate, and ammonium.',
        '<strong>Electron transfer:</strong> Click a metal atom, then click a nonmetal atom, and hit Transfer Electron to shift valence electrons one at a time.',
        '<strong>Polyatomic shortcuts:</strong> Polyatomic ions enter the canvas pre-ionized, so you only need to adjust ratios until the total charge balances to zero.',
        '<strong>Balanced state:</strong> As soon as all atoms are fully ionized and the net charge equals zero, the compound name and formula appear in the header.',
        '<strong>Reset:</strong> Click Clear Canvas whenever you want a clean slate.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Build sodium chloride (NaCl).</strong> Sodium loses 1 electron while chlorine gains 1: a clean 1:1 balance.',
        '<strong>Balance unequal charges.</strong> Build magnesium chloride (MgCl₂). Because magnesium sheds two electrons, you must supply two chlorine atoms to accept them.',
        '<strong>Compare oxidation states.</strong> Build iron(II) chloride (FeCl₂) and then iron(III) chloride (FeCl₃). Observe how the metal charge dictates the anion subscript.',
        '<strong>Work with polyatomic ions.</strong> Build calcium nitrate (Ca(NO₃)₂). Notice how parentheses preserve the nitrate group as a single chemical entity.',
        '<strong>Investigate lattice structures.</strong> After balancing NaCl, switch to the Lattice tab to inspect how alternating charges maximize attractive forces and minimize repulsions.',
        '<strong>Solve a least common multiple ratio.</strong> Build aluminum oxide (Al₂O₃). Aluminum forms a +3 cation while oxygen forms a -2 oxide ion: see why a 2:3 ratio is necessary for electroneutrality.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Ionic bonding:</strong> Mutual electrostatic attraction between positively charged cations and negatively charged anions following complete electron transfer.',
        '<strong>Electroneutrality:</strong> Bulk ionic compounds must have zero net charge, requiring stoichiometric ratios that balance total positive and negative charges.',
        '<strong>Oxidation state:</strong> The apparent charge on an atom when valence electrons are assigned to the more electronegative partner.',
        '<strong>Lattice energy:</strong> The energy released when gaseous ions coalesce into a solid crystalline lattice, providing immense thermodynamic stability.',
        '<strong>IUPAC nomenclature:</strong> Name the cation first (with Roman numerals for variable-charge metals), followed by the monatomic anion with an "-ide" suffix or the polyatomic ion name.',
      ],
    },
  ],
};
