import { describe, it, expect } from 'vitest';
import {
  PERIODIC_TABLE_CHALLENGES,
  verifyPeriodicTableChallenge,
  applyPeriodicTableChallengeSolution,
  PeriodicTableChallenge,
  PropertyMode,
  ViewMode,
} from '../../components/simulations/periodicTable/periodicTableChallenges';
import {
  PERIODIC_TABLE_ELEMENTS,
  Element,
} from '../../components/simulations/periodicTable/periodicTableData';

describe('Periodic Table Engine & Challenge Solvability', () => {
  describe('Element Data Invariants', () => {
    it('contains all 117 standard elements with required atomic properties', () => {
      expect(PERIODIC_TABLE_ELEMENTS.length).toBe(117);
      const elementsByZ = new Map(PERIODIC_TABLE_ELEMENTS.map(e => [e.atomicNumber, e]));
      for (let z = 1; z <= 117; z++) {
        expect(elementsByZ.has(z)).toBe(true);
      }
    });

    it('validates critical trend benchmark elements', () => {
      const fluorine = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 9);
      expect(fluorine).toBeDefined();
      expect(fluorine?.symbol).toBe('F');
      expect(fluorine?.electronegativity).toBeGreaterThan(3.9);

      const cesium = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 55);
      expect(cesium).toBeDefined();
      expect(cesium?.symbol).toBe('Cs');
      expect(cesium?.ionizationEnergy).toBeLessThan(380);

      const silicon = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 14);
      expect(silicon).toBeDefined();
      expect(silicon?.symbol).toBe('Si');
      expect(silicon?.category).toBe('metalloid');

      const xenon = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 54);
      expect(xenon).toBeDefined();
      expect(xenon?.symbol).toBe('Xe');
      expect(xenon?.category).toBe('noble gas');
      expect(xenon?.meltingPoint).toBeCloseTo(161.4, 0);
      expect(xenon?.boilingPoint).toBeCloseTo(165.0, 0);
    });
  });

  describe('Challenge Verification Engine', () => {
    const fluorine = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 9)!;
    const cesium = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 55)!;
    const silicon = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 14)!;
    const xenon = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 54)!;
    const oxygen = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === 8)!;

    it('Challenge 1 (Peak Electronegativity): verifies element and property mode correctly', () => {
      const id = 'pt_fluorine_electronegativity';

      // No element
      expect(verifyPeriodicTableChallenge(id, {
        selectedElement: null,
        propertyMode: 'none',
        viewMode: 'standard',
        temperature: 298,
      }).success).toBe(false);

      // Wrong element
      expect(verifyPeriodicTableChallenge(id, {
        selectedElement: oxygen,
        propertyMode: 'electronegativity',
        viewMode: 'property',
        temperature: 298,
      }).success).toBe(false);

      // Correct element but missing property mode
      const missingProp = verifyPeriodicTableChallenge(id, {
        selectedElement: fluorine,
        propertyMode: 'none',
        viewMode: 'standard',
        temperature: 298,
      });
      expect(missingProp.success).toBe(false);
      expect(missingProp.message).toContain('electronegativity');

      // Solved
      const solved = verifyPeriodicTableChallenge(id, {
        selectedElement: fluorine,
        propertyMode: 'electronegativity',
        viewMode: 'property',
        temperature: 298,
      });
      expect(solved.success).toBe(true);
      expect(solved.message).toContain('Fluorine');
    });

    it('Challenge 2 (Alkali Ionization): verifies Cesium and ionization energy mode', () => {
      const id = 'pt_cesium_ionization';

      // Wrong property mode
      expect(verifyPeriodicTableChallenge(id, {
        selectedElement: cesium,
        propertyMode: 'atomic_radius',
        viewMode: 'property',
        temperature: 298,
      }).success).toBe(false);

      // Solved
      const solved = verifyPeriodicTableChallenge(id, {
        selectedElement: cesium,
        propertyMode: 'ionization_energy',
        viewMode: 'property',
        temperature: 298,
      });
      expect(solved.success).toBe(true);
    });

    it('Challenge 3 (Semiconductor Metalloid): verifies Silicon and atomic radius mode', () => {
      const id = 'pt_silicon_semiconductor';

      // Wrong element
      expect(verifyPeriodicTableChallenge(id, {
        selectedElement: cesium,
        propertyMode: 'atomic_radius',
        viewMode: 'property',
        temperature: 298,
      }).success).toBe(false);

      // Solved
      const solved = verifyPeriodicTableChallenge(id, {
        selectedElement: silicon,
        propertyMode: 'atomic_radius',
        viewMode: 'property',
        temperature: 298,
      });
      expect(solved.success).toBe(true);
    });

    it('Challenge 4 (Noble Gas Liquefaction): verifies Xenon, temperature view, and thermal window', () => {
      const id = 'pt_xenon_liquefaction';

      // Wrong view mode
      expect(verifyPeriodicTableChallenge(id, {
        selectedElement: xenon,
        propertyMode: 'none',
        viewMode: 'standard',
        temperature: 163,
      }).success).toBe(false);

      // Temperature too high (gas at room temp 298 K)
      const tooWarm = verifyPeriodicTableChallenge(id, {
        selectedElement: xenon,
        propertyMode: 'none',
        viewMode: 'temperature',
        temperature: 298,
      });
      expect(tooWarm.success).toBe(false);
      expect(tooWarm.message).toContain('161 K and 165 K');

      // Temperature too cold (solid below 161 K)
      const tooCold = verifyPeriodicTableChallenge(id, {
        selectedElement: xenon,
        propertyMode: 'none',
        viewMode: 'temperature',
        temperature: 150,
      });
      expect(tooCold.success).toBe(false);

      // Solved at 163 K
      const solved = verifyPeriodicTableChallenge(id, {
        selectedElement: xenon,
        propertyMode: 'none',
        viewMode: 'temperature',
        temperature: 163,
      });
      expect(solved.success).toBe(true);
    });

    it('handles unknown challenge id gracefully', () => {
      const res = verifyPeriodicTableChallenge('nonexistent_id', {
        selectedElement: fluorine,
        propertyMode: 'electronegativity',
        viewMode: 'property',
        temperature: 298,
      });
      expect(res.success).toBe(false);
      expect(res.message).toContain('Select a challenge');
    });
  });

  describe('Solution Applicator', () => {
    it('applyPeriodicTableChallengeSolution correctly updates all simulation levers', () => {
      PERIODIC_TABLE_CHALLENGES.forEach((challenge: PeriodicTableChallenge) => {
        let selectedEl: Element | null = null;
        let propertyMode: PropertyMode = 'none';
        let viewMode: ViewMode = 'standard';
        let temp = 298;

        applyPeriodicTableChallengeSolution(
          challenge,
          (el) => { selectedEl = el; },
          (pm) => { propertyMode = pm; },
          (vm) => { viewMode = vm; },
          (t) => { temp = t; }
        );

        expect(selectedEl).not.toBeNull();
        expect((selectedEl as Element | null)?.atomicNumber).toBe(challenge.solutionSetup.atomicNumber);
        expect(propertyMode).toBe(challenge.solutionSetup.propertyMode);
        expect(viewMode).toBe(challenge.solutionSetup.viewMode);
        expect(temp).toBe(challenge.solutionSetup.temperature);

        // Verification must pass on solution state
        const ver = verifyPeriodicTableChallenge(challenge.id, {
          selectedElement: selectedEl,
          propertyMode,
          viewMode,
          temperature: temp,
        });
        expect(ver.success).toBe(true);
      });
    });
  });
});
