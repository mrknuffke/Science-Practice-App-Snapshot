/**
 * Electron-group slot allocator for Lewis-structure rendering.
 *
 * Total electron groups around an atom = bonds + lone pairs + unpaired
 * electrons. Lewis dots distribute these uniformly:
 *   - 4 groups (octet): N/E/S/W cardinals (90° apart)
 *   - 3 groups: trigonal, 120° apart (e.g., 1 bond + 2 LPs)
 *   - 2 groups: linear, 180° apart (e.g., 1 bond + 1 LP)
 *   - 5+ groups: even angular spread (expanded octet)
 *
 * Bonds stay at their actual visual angle (no kink to bond line); the
 * algorithm just claims one slot per bond and returns the remaining slots
 * for non-bond electrons. For 4-group octets the slot framework is fixed
 * at N/E/S/W (page-relative); otherwise the framework rotates so the first
 * bond aligns with slot 0.
 */
import type { Atom, Molecule } from '../../../types';

const CARDINAL_ANGLES = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
const OPPOSITE_INDEX = [2, 3, 0, 1];

const angDist = (a: number, b: number): number => {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return Math.abs(d);
};

const optimalBondAssignment = (bondAngles: number[]): number[] => {
  const N = bondAngles.length;
  if (N === 0) return [];
  if (N > 4) {
    return bondAngles.map(a => {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < 4; i++) {
        const d = angDist(a, CARDINAL_ANGLES[i]);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      return best;
    });
  }
  let bestAssign: number[] = [];
  let bestCost = Infinity;
  const permute = (arr: number[], k: number): void => {
    if (k === N) {
      let cost = 0;
      for (let i = 0; i < N; i++) cost += angDist(bondAngles[i], CARDINAL_ANGLES[arr[i]]);
      if (cost < bestCost) {
        bestCost = cost;
        bestAssign = arr.slice(0, N);
      }
      return;
    }
    for (let i = k; i < arr.length; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      permute(arr, k + 1);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  permute([0, 1, 2, 3], 0);
  return bestAssign;
};

const collectBondAngles = (atom: Atom, molecule: Molecule): number[] => {
  const angles: number[] = [];
  molecule.bonds.forEach(bond => {
    let other: Atom | undefined;
    if (bond.atom1Id === atom.id) other = molecule.atoms.find(a => a.id === bond.atom2Id);
    else if (bond.atom2Id === atom.id) other = molecule.atoms.find(a => a.id === bond.atom1Id);
    if (!other) return;
    const dx = other.position.x - atom.position.x;
    const dy = other.position.y - atom.position.y;
    if (dx === 0 && dy === 0) return;
    angles.push(Math.atan2(dy, dx));
  });
  return angles;
};

// Returns slot angles for non-bond electrons given the total occupant count.
const computeSlotAngles = (bondAngles: number[], numSlots: number): number[] => {
  if (numSlots <= 0) return [];
  const totalOccupants = bondAngles.length + numSlots;

  // No bonds: even distribution starting at N (-π/2).
  if (bondAngles.length === 0) {
    const slots: number[] = [];
    for (let i = 0; i < numSlots; i++) {
      slots.push(-Math.PI / 2 + (i * 2 * Math.PI) / numSlots);
    }
    return slots;
  }

  // Octet (4 groups): cardinal slots, optimal bond assignment.
  if (totalOccupants === 4) {
    const used = [false, false, false, false];
    const assignment = optimalBondAssignment(bondAngles);
    for (const idx of assignment) {
      if (idx >= 0 && idx < 4) used[idx] = true;
    }
    const free: number[] = [];
    for (let i = 0; i < 4; i++) if (!used[i]) free.push(i);
    // Perpendicular-to-bond placement preferred: slots whose opposite is free
    // come first (e.g., O₂ → LPs at N+S; HCl → LPs at N+S+E).
    free.sort((a, b) => {
      const aOppUsed = used[OPPOSITE_INDEX[a]] ? 1 : 0;
      const bOppUsed = used[OPPOSITE_INDEX[b]] ? 1 : 0;
      if (aOppUsed !== bOppUsed) return aOppUsed - bOppUsed;
      return a - b;
    });
    return free.slice(0, numSlots).map(idx => CARDINAL_ANGLES[idx]);
  }

  // Non-octet: even angular framework, anchored so the first bond is at slot 0.
  // This gives 1-bond-+-2-LP atoms a trigonal arrangement (120° intervals),
  // 1-bond-+-1-LP atoms a linear arrangement (180°), etc.
  const interval = (2 * Math.PI) / totalOccupants;
  const anchor = bondAngles[0];
  const idealSlots: number[] = [];
  for (let k = 0; k < totalOccupants; k++) {
    idealSlots.push(anchor + k * interval);
  }

  // Mark slots claimed by bonds. bond[0] takes slot 0; additional bonds claim
  // their nearest unused slot.
  const used = new Array(totalOccupants).fill(false);
  used[0] = true;
  for (let bi = 1; bi < bondAngles.length; bi++) {
    let bestSlot = -1;
    let bestDist = Infinity;
    for (let si = 1; si < totalOccupants; si++) {
      if (used[si]) continue;
      const d = angDist(bondAngles[bi], idealSlots[si]);
      if (d < bestDist) { bestDist = d; bestSlot = si; }
    }
    if (bestSlot >= 0) used[bestSlot] = true;
  }

  const slots: number[] = [];
  for (let si = 0; si < totalOccupants; si++) {
    if (!used[si]) slots.push(idealSlots[si]);
  }
  return slots;
};

export interface CardinalElectronPlacement {
  lonePairAngles: number[];
  unpairedAngles: number[];
}

export const getCardinalElectronPlacement = (
  atom: Atom,
  molecule: Molecule,
  lonePairCount: number,
  unpairedCount: number,
): CardinalElectronPlacement => {
  const numSlots = lonePairCount + unpairedCount;
  if (numSlots === 0) return { lonePairAngles: [], unpairedAngles: [] };

  const bondAngles = collectBondAngles(atom, molecule);
  const slotAngles = computeSlotAngles(bondAngles, numSlots);

  return {
    lonePairAngles: slotAngles.slice(0, lonePairCount),
    unpairedAngles: slotAngles.slice(lonePairCount, lonePairCount + unpairedCount),
  };
};
