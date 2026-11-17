import type { Molecule } from '../../../types';

/**
 * Applies a simple force-directed layout to arrange atoms in a 2D plane.
 * This ensures bonded atoms are kept at a stable distance while repelling others,
 * naturally approximating VSEPR shapes in 2D for simple molecules.
 */
export function autoLayoutMolecule(molecule: Molecule): Molecule {
  if (molecule.atoms.length < 2) return molecule;

  const IDEAL_BOND_LENGTH = 110;
  const REPULSION_STRENGTH = 4000;
  const ATTRACTION_STRENGTH = 0.05;
  const DAMPING = 0.8;
  const ITERATIONS = 100;

  // Clone molecule to avoid mutating original state during calculation
  let atoms = molecule.atoms.map(a => ({
    ...a,
    vx: 0,
    vy: 0,
  }));

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // 1. Repulsion between all pairs of atoms
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dx = atoms[i].position.x - atoms[j].position.x;
        const dy = atoms[i].position.y - atoms[j].position.y;
        let distSq = dx * dx + dy * dy;
        
        // Prevent division by zero if atoms are exactly perfectly overlapped
        if (distSq < 1) {
            atoms[i].position.x += Math.random() * 2 - 1;
            atoms[i].position.y += Math.random() * 2 - 1;
            distSq = 1;
        }

        const dist = Math.sqrt(distSq);
        const force = REPULSION_STRENGTH / distSq;

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        atoms[i].vx += fx;
        atoms[i].vy += fy;
        atoms[j].vx -= fx;
        atoms[j].vy -= fy;
      }
    }

    // 2. Attraction along bonds
    molecule.bonds.forEach(bond => {
      const atom1Index = atoms.findIndex(a => a.id === bond.atom1Id);
      const atom2Index = atoms.findIndex(a => a.id === bond.atom2Id);

      if (atom1Index === -1 || atom2Index === -1) return;

      const a1 = atoms[atom1Index];
      const a2 = atoms[atom2Index];

      const dx = a2.position.x - a1.position.x;
      const dy = a2.position.y - a1.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      // Force connects them to the ideal bond length
      const force = (dist - IDEAL_BOND_LENGTH) * ATTRACTION_STRENGTH;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      a1.vx += fx;
      a1.vy += fy;
      a2.vx -= fx;
      a2.vy -= fy;
    });

    // 3. Update positions and apply damping
    for (let i = 0; i < atoms.length; i++) {
      atoms[i].position.x += atoms[i].vx;
      atoms[i].position.y += atoms[i].vy;
      atoms[i].vx *= DAMPING;
      atoms[i].vy *= DAMPING;
      
      // Keep within bounds
      atoms[i].position.x = Math.max(50, Math.min(750, atoms[i].position.x));
      atoms[i].position.y = Math.max(50, Math.min(470, atoms[i].position.y));
    }
  }

  // Clean up velocity properties to return pure Molecule type
  return {
    ...molecule,
    atoms: atoms.map(({ vx, vy, ...atom }) => atom),
  };
}
