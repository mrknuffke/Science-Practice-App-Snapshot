import { describe, it, expect } from 'vitest';
import { KINETICS_CHALLENGES } from '../../components/simulations/kinetics/kineticsChallenges';
import { DIFFUSION_CHALLENGES } from '../../components/simulations/diffusion/diffusionChallenges';
import { ECOSYSTEM_CHALLENGES } from '../../components/simulations/ecosystem/ecosystemChallenges';
import { seedEcosystem, updateEcosystem } from '../../components/simulations/ecosystem/ecologyEngine';
import { HW_CHALLENGES } from '../../components/simulations/populationGenetics/hwChallenges';
import { initPopulation, stepGeneration } from '../../components/simulations/populationGenetics/hwEngine';
import { ATOM_CHALLENGES } from '../../components/simulations/buildAnAtom/BuildAnAtom';
import { PRESET_MOLECULES } from '../../components/simulations/covalentBonding/presetMolecules';
import { createPreIonizedAtom } from '../../components/simulations/ionicBonding/ionicBuilderEngine';
import { MOTION_CHALLENGES } from '../../components/simulations/motionTracker/motionChallenges';
import { verifyKinematicChallenge } from '../../components/simulations/motionTracker/motionEngine';
import { BLOOD_BUFFER_CHALLENGES, verifyBloodBufferChallenge } from '../../components/simulations/bloodBuffer/bloodBufferChallenges';
import { NUCLEAR_CHALLENGES, verifyNuclearChallenge } from '../../components/simulations/nuclearDecay/nuclearDecayChallenges';
import { GAS_LAWS_CHALLENGES, verifyGasLawsChallenge } from '../../components/simulations/gasLaws/gasLawsChallenges';
import { FBD_SCENARIOS } from '../../components/simulations/freeBodyDiagram/fbdScenarios';
import { verifyFbd } from '../../components/simulations/freeBodyDiagram/fbdEngine';
import { PERIODIC_TABLE_CHALLENGES, verifyPeriodicTableChallenge } from '../../components/simulations/periodicTable/periodicTableChallenges';
import { PERIODIC_TABLE_ELEMENTS } from '../../components/simulations/periodicTable/periodicTableData';
import { REGULATORY_CHALLENGES, verifyRegulatoryChallenge } from '../../components/simulations/regulatoryModeler/regulatoryChallenges';

describe('Simulations Hub Challenge Deck Solvability & Inquiry Standards', () => {

  describe('Pedagogical Interaction Invariants (Goals, Not Recipes)', () => {
    const challengeSets = [
      { name: 'Reaction Kinetics', challenges: KINETICS_CHALLENGES },
      { name: 'Cell Membrane Diffusion', challenges: DIFFUSION_CHALLENGES },
      { name: 'Ecosystem Dynamics', challenges: ECOSYSTEM_CHALLENGES },
      { name: 'Population Genetics', challenges: HW_CHALLENGES },
      { name: 'Build An Atom', challenges: ATOM_CHALLENGES },
      { name: 'Motion Tracker', challenges: MOTION_CHALLENGES },
      { name: 'Arterial Blood Buffers', challenges: BLOOD_BUFFER_CHALLENGES },
      { name: 'Nuclear Decay & Dating', challenges: NUCLEAR_CHALLENGES },
      { name: 'Gas Laws', challenges: GAS_LAWS_CHALLENGES },
      { name: 'Periodic Table Trends', challenges: PERIODIC_TABLE_CHALLENGES },
      { name: 'Biological Regulatory Systems', challenges: REGULATORY_CHALLENGES },
    ];

    challengeSets.forEach(({ name, challenges }) => {
      it(`${name}: all challenges have 3-tiered hint ladders and non-empty solutions`, () => {
        expect(challenges.length).toBeGreaterThan(0);
        challenges.forEach(c => {
          expect(c.id).toBeDefined();
          expect(c.title.length).toBeGreaterThan(0);
          expect(c.description.length).toBeGreaterThan(10);
          expect(c.hints).toBeDefined();
          expect(c.hints?.length).toBe(3);
          expect(c.solution).toBeDefined();
          expect(c.solution?.length).toBeGreaterThan(0);
        });
      });
    });

    it('Reaction Kinetics: start states are neutral and distinct from solution setups', () => {
      KINETICS_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        // Start state should never match solution setup
        const isIdentical =
          c.start.temp === c.solutionSetup.temp &&
          c.start.catalyst === c.solutionSetup.catalyst &&
          c.start.mode === c.solutionSetup.mode;
        expect(isIdentical).toBe(false);
      });
    });

    it('Ecosystem Dynamics: start states are distinct from solution setups', () => {
      ECOSYSTEM_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        const startDiff =
          c.start.seedHerbivores !== c.solutionSetup.seedHerbivores ||
          c.start.seedCarnivores !== c.solutionSetup.seedCarnivores ||
          c.start.plantRegrowthTime !== c.solutionSetup.plantRegrowthTime ||
          c.start.herbivoreReproduceChance !== c.solutionSetup.herbivoreReproduceChance;
        expect(startDiff).toBe(true);
      });
    });

    it('Population Genetics: start states are distinct from solution setups', () => {
      HW_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        const startDiff =
          c.start.selectionEnabled !== c.solutionSetup.selectionEnabled ||
          c.start.populationSize !== c.solutionSetup.populationSize ||
          c.start.mutationEnabled !== c.solutionSetup.mutationEnabled ||
          c.start.fitnessaa !== c.solutionSetup.fitnessaa;
        expect(startDiff).toBe(true);
      });
    });

    it('Motion Tracker: start states are neutral and distinct from solution setups', () => {
      MOTION_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        expect(c.start.points.length).toBe(0);
        expect(c.solutionSetup.points.length).toBeGreaterThanOrEqual(10);
        expect(c.start.scaleLocked).toBe(false);
        expect(c.solutionSetup.scaleLocked).toBe(true);
        expect(c.start.originLocked).toBe(false);
        expect(c.solutionSetup.originLocked).toBe(true);
      });
    });

    it('Arterial Blood Buffers: start states are neutral and distinct from solution setups', () => {
      BLOOD_BUFFER_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        const startDiff =
          c.start.respRate !== c.solutionSetup.respRate ||
          c.start.isRebreathing !== c.solutionSetup.isRebreathing ||
          c.start.diagnosis !== c.solutionSetup.diagnosis;
        expect(startDiff).toBe(true);
      });
    });

    it('Nuclear Decay & Dating: start states are neutral and distinct from solution setups', () => {
      NUCLEAR_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        expect(c.start.halfLives).toBe(0);
        expect(c.solutionSetup.halfLives).toBeGreaterThan(0);
        expect(c.solutionSetup.userAge).toBeDefined();
      });
    });

    it('Gas Laws: start states are neutral and distinct from solution setups', () => {
      GAS_LAWS_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        const startDiff =
          c.start.pistonY !== c.solutionSetup.pistonY ||
          c.start.temperature !== c.solutionSetup.temperature ||
          c.start.countA !== c.solutionSetup.countA ||
          c.start.countB !== c.solutionSetup.countB;
        expect(startDiff).toBe(true);
      });
    });

    it('Periodic Table Trends: start states are neutral and distinct from solution setups', () => {
      PERIODIC_TABLE_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        expect(c.start.atomicNumber).toBeNull();
        expect(c.solutionSetup.atomicNumber).not.toBeNull();
      });
    });

    it('Biological Regulatory Systems: start states have empty connections and uninduced signals', () => {
      REGULATORY_CHALLENGES.forEach(c => {
        expect(c.start).toBeDefined();
        expect(c.solutionSetup).toBeDefined();
        expect(c.start.connections.length).toBe(0);
        expect(c.solutionSetup.connections.length).toBeGreaterThan(0);
      });
    });

    it('Free Body Diagrams: all 11 scenarios have 3-tiered hint ladders, target acceleration, and valid solution forces', () => {
      FBD_SCENARIOS.forEach(s => {
        expect(s.hints).toBeDefined();
        expect(s.hints?.length).toBe(3);
        expect(s.targetAcceleration).toBeDefined();
        expect(s.solutionForces).toBeDefined();
        expect(s.solutionForces?.length).toBe(s.expectedForces.length);
      });
    });
  });

  describe('Cell Membrane Diffusion Solvability', () => {
    it('all challenges have valid particle setups and targeted solution proteins', () => {
      DIFFUSION_CHALLENGES.forEach(c => {
        expect(c.initialSetup).toBeDefined();
        expect(c.initialSetup.oxygenExt).toBeGreaterThanOrEqual(0);
        expect(c.initialSetup.glucoseExt).toBeGreaterThanOrEqual(0);
        expect(c.initialSetup.sodiumExt).toBeGreaterThanOrEqual(0);
      });

      const glucoseChallenge = DIFFUSION_CHALLENGES.find(c => c.id === 'facilitated_glucose');
      expect(glucoseChallenge?.solutionProteins?.some(p => p.type === 'channel' && p.allowedParticle === 'glucose')).toBe(true);

      const sodiumChallenge = DIFFUSION_CHALLENGES.find(c => c.id === 'active_sodium');
      expect(sodiumChallenge?.solutionProteins?.some(p => p.type === 'pump' && p.allowedParticle === 'sodium')).toBe(true);

      const homeoChallenge = DIFFUSION_CHALLENGES.find(c => c.id === 'homeostasis');
      expect(homeoChallenge?.solutionProteins?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Ecosystem Engine Simulation Solvability', () => {
    it('green_world solution sustains both plants and herbivores over 80 ticks', () => {
      const challenge = ECOSYSTEM_CHALLENGES.find(c => c.id === 'green_world')!;
      let state = seedEcosystem(challenge.solutionSetup);

      for (let t = 0; t < 80; t++) {
        state = updateEcosystem(state, challenge.solutionSetup);
      }

      expect(state.tick).toBe(80);
      expect(state.plantCount).toBeGreaterThanOrEqual(50);
      expect(state.herbivoreCount).toBeGreaterThan(0);
      expect(state.carnivoreCount).toBe(0);
    });

    it('three_trophic solution sustains multi-trophic populations', () => {
      const challenge = ECOSYSTEM_CHALLENGES.find(c => c.id === 'three_trophic')!;
      let state = seedEcosystem(challenge.solutionSetup);

      for (let t = 0; t < 60; t++) {
        state = updateEcosystem(state, challenge.solutionSetup);
      }

      expect(state.tick).toBe(60);
      expect(state.plantCount).toBeGreaterThan(0);
      expect(state.herbivoreCount).toBeGreaterThan(0);
      expect(state.carnivoreCount).toBeGreaterThan(0);
    });
  });

  describe('Hardy-Weinberg Engine Simulation Solvability', () => {
    it('hw_null solution preserves allele frequency p close to baseline over 25 generations', () => {
      const challenge = HW_CHALLENGES.find(c => c.id === 'hw_null')!;
      let sumP = 0;
      const runs = 25;
      for (let r = 0; r < runs; r++) {
        let state = initPopulation(challenge.solutionSetup);
        for (let g = 0; g < 25; g++) {
          state = stepGeneration(state, challenge.solutionSetup);
        }
        expect(state.generation).toBe(25);
        sumP += state.p;
      }
      const meanP = sumP / runs;
      expect(Math.abs(meanP - 0.50)).toBeLessThan(0.10);
    });

    it('selection_recessive solution drives q downward across generations', () => {
      const challenge = HW_CHALLENGES.find(c => c.id === 'selection_recessive')!;
      let state = initPopulation(challenge.solutionSetup);

      for (let g = 0; g < 30; g++) {
        state = stepGeneration(state, challenge.solutionSetup);
      }

      expect(state.generation).toBe(30);
      // q starts at 0.50 and should drop under strong selection against aa
      expect(state.q).toBeLessThan(0.35);
    });

    it('heterozygote_advantage maintains balanced polymorphism', () => {
      const challenge = HW_CHALLENGES.find(c => c.id === 'heterozygote_advantage')!;
      let state = initPopulation(challenge.solutionSetup);

      for (let g = 0; g < 30; g++) {
        state = stepGeneration(state, challenge.solutionSetup);
      }

      expect(state.generation).toBe(30);
      // Theoretical overdominance equilibrium for wAA=0.7, wAa=1.0, waa=0.4 is p ≈ 0.67
      expect(state.p).toBeGreaterThan(0.50);
      expect(state.p).toBeLessThan(0.85);
    });
  });

  describe('Covalent & Ionic Bonding Synthesis Solvability', () => {
    it('covalent presets exist for all standard molecular targets', () => {
      const targetIds = ['H2O', 'CO2', 'NH3', 'CH4', 'N2', 'HCN', 'CH2O', 'SF6'];
      targetIds.forEach(id => {
        const found = PRESET_MOLECULES.find(m => m.id === id);
        expect(found).toBeDefined();
        expect(found?.molecule.atoms.length).toBeGreaterThan(1);
        expect(found?.molecule.bonds.length).toBeGreaterThan(0);
      });
    });

    it('ionic builder pre-ionized atoms balance charges in stoichiometric ratios', () => {
      // NaCl (1:1)
      const na = createPreIonizedAtom('Na', { x: 0, y: 0 });
      const cl = createPreIonizedAtom('Cl', { x: 0, y: 0 });
      expect(na.charge + cl.charge).toBe(0);

      // MgO (1:1 divalent)
      const mg = createPreIonizedAtom('Mg', { x: 0, y: 0 });
      const o = createPreIonizedAtom('O', { x: 0, y: 0 });
      expect(mg.charge + o.charge).toBe(0);

      // CaCl2 (1:2)
      const ca = createPreIonizedAtom('Ca', { x: 0, y: 0 });
      const cl1 = createPreIonizedAtom('Cl', { x: 0, y: 0 });
      const cl2 = createPreIonizedAtom('Cl', { x: 0, y: 0 });
      expect(ca.charge + cl1.charge + cl2.charge).toBe(0);

      // Al2O3 (2:3)
      const al1 = createPreIonizedAtom('Al', { x: 0, y: 0 });
      const al2 = createPreIonizedAtom('Al', { x: 0, y: 0 });
      const o1 = createPreIonizedAtom('O', { x: 0, y: 0 });
      const o2 = createPreIonizedAtom('O', { x: 0, y: 0 });
      const o3 = createPreIonizedAtom('O', { x: 0, y: 0 });
      expect(al1.charge + al2.charge + o1.charge + o2.charge + o3.charge).toBe(0);
    });
  });

  describe('Build An Atom Configuration Solvability', () => {
    it('all 8 atomic challenges satisfy nuclear and electrical definitions', () => {
      ATOM_CHALLENGES.forEach(c => {
        const massNumber = c.targetP + c.targetN;
        const netCharge = c.targetP - c.targetE;
        expect(c.targetP).toBeGreaterThan(0);
        expect(massNumber).toBeGreaterThanOrEqual(c.targetP);

        if (c.id === 1) { // Protium: 1H
          expect(massNumber).toBe(1);
          expect(netCharge).toBe(0);
        } else if (c.id === 2) { // Deuterium: 2H
          expect(massNumber).toBe(2);
          expect(netCharge).toBe(0);
        } else if (c.id === 3) { // Helium-4
          expect(massNumber).toBe(4);
          expect(netCharge).toBe(0);
        } else if (c.id === 4) { // Lithium-7 Cation (Li+)
          expect(massNumber).toBe(7);
          expect(netCharge).toBe(1);
        } else if (c.id === 5) { // Carbon-12
          expect(massNumber).toBe(12);
          expect(netCharge).toBe(0);
        } else if (c.id === 6) { // Oxygen-16 Anion (O2-)
          expect(massNumber).toBe(16);
          expect(netCharge).toBe(-2);
        } else if (c.id === 7) { // Tritium: 3H
          expect(massNumber).toBe(3);
          expect(netCharge).toBe(0);
        } else if (c.id === 8) { // Neon-20
          expect(massNumber).toBe(20);
          expect(netCharge).toBe(0);
        }
      });
    });
  });

  describe('Motion Tracker Kinematics Solvability', () => {
    it('glider_const_v solution produces uniform velocity matching 1.50 m/s', () => {
      const challenge = MOTION_CHALLENGES.find(c => c.id === 'glider_const_v')!;
      expect(challenge).toBeDefined();
      const res = verifyKinematicChallenge('glider_const_v', challenge.solutionSetup.points, challenge.solutionSetup.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('1.50 m/s');
    });

    it('free_fall_g solution confirms gravitational acceleration of -9.80 m/s²', () => {
      const challenge = MOTION_CHALLENGES.find(c => c.id === 'free_fall_g')!;
      expect(challenge).toBeDefined();
      const res = verifyKinematicChallenge('free_fall_g', challenge.solutionSetup.points, challenge.solutionSetup.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('gravitational acceleration');
    });

    it('ramp_accel solution confirms uniform acceleration of 2.00 m/s² and displacement', () => {
      const challenge = MOTION_CHALLENGES.find(c => c.id === 'ramp_accel')!;
      expect(challenge).toBeDefined();
      const res = verifyKinematicChallenge('ramp_accel', challenge.solutionSetup.points, challenge.solutionSetup.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('2.00 m/s²');
    });

    it('projectile_2d solution demonstrates 2D independence of horizontal and vertical vectors', () => {
      const challenge = MOTION_CHALLENGES.find(c => c.id === 'projectile_2d')!;
      expect(challenge).toBeDefined();
      const res = verifyKinematicChallenge('projectile_2d', challenge.solutionSetup.points, challenge.solutionSetup.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('Demonstrated 2D independence');
    });
  });

  describe('Arterial Blood Buffers Solvability', () => {
    it('all 4 clinical challenges are physiologically compensated by their solution setup', () => {
      BLOOD_BUFFER_CHALLENGES.forEach(challenge => {
        const res = verifyBloodBufferChallenge(
          challenge,
          challenge.solutionSetup,
          challenge.solutionSetup.diagnosis
        );
        expect(res.success).toBe(true);
        expect(res.message).toContain('correctly and stabilized the patient');
      });
    });
  });

  describe('Nuclear Decay & Dating Solvability', () => {
    it('all 4 radiometric dating challenges are verified by their solution setup', () => {
      NUCLEAR_CHALLENGES.forEach(challenge => {
        const res = verifyNuclearChallenge(
          challenge,
          challenge.solutionSetup.isotopeKey,
          challenge.solutionSetup.halfLives,
          String(challenge.solutionSetup.userAge)
        );
        expect(res.success).toBe(true);
        expect(res.message).toContain('You dated the artifact to');
      });
    });
  });

  describe('Gas Laws Solvability', () => {
    it('all 4 gas laws challenges evaluate to success under their solution parameters', () => {
      // Boyle
      const boyle = verifyGasLawsChallenge('gas_boyle', {
        temperature: 300,
        totalPressure: 2.0,
        pressureA: 2.0,
        pressureB: 0,
        pistonY: 125,
        countA: 30,
        countB: 0,
      });
      expect(boyle.success).toBe(true);

      // Charles
      const charles = verifyGasLawsChallenge('gas_charles', {
        temperature: 480,
        totalPressure: 1.25,
        pressureA: 1.25,
        pressureB: 0,
        pistonY: 290,
        countA: 30,
        countB: 0,
      });
      expect(charles.success).toBe(true);

      // Gay-Lussac
      const gayLussac = verifyGasLawsChallenge('gas_gay_lussac', {
        temperature: 550,
        totalPressure: 2.65,
        pressureA: 2.65,
        pressureB: 0,
        pistonY: 80,
        countA: 30,
        countB: 0,
      });
      expect(gayLussac.success).toBe(true);

      // Dalton
      const dalton = verifyGasLawsChallenge('gas_dalton', {
        temperature: 320,
        totalPressure: 1.8,
        pressureA: 0.9,
        pressureB: 0.9,
        pistonY: 170,
        countA: 35,
        countB: 35,
      });
      expect(dalton.success).toBe(true);
    });
  });

  describe('Free Body Diagram Solvability', () => {
    it('all 11 scenarios are fully solved and verified by their solutionForces', () => {
      FBD_SCENARIOS.forEach(scenario => {
        expect(scenario.solutionForces).toBeDefined();
        const res = verifyFbd(scenario.solutionForces!, scenario);
        expect(res.correct.length).toBe(scenario.expectedForces.length);
        expect(res.missing.length).toBe(0);
        expect(res.misdirected.length).toBe(0);
        expect(res.extra.length).toBe(0);
        expect(res.netForceSatisfied).toBe(true);
      });
    });
  });

  describe('Periodic Table Solvability', () => {
    it('all 4 periodic table challenges evaluate to success under their solution parameters', () => {
      PERIODIC_TABLE_CHALLENGES.forEach(c => {
        const el = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === c.solutionSetup.atomicNumber) ?? null;
        const res = verifyPeriodicTableChallenge(c.id, {
          selectedElement: el,
          propertyMode: c.solutionSetup.propertyMode,
          viewMode: c.solutionSetup.viewMode,
          temperature: c.solutionSetup.temperature,
        });
        expect(res.success).toBe(true);
      });
    });
  });

  describe('Biological Regulatory Systems Solvability', () => {
    it('all 4 regulatory modeler challenges evaluate to success under their solution setups', () => {
      REGULATORY_CHALLENGES.forEach(c => {
        const res = verifyRegulatoryChallenge(c.id, c.solutionSetup.nodes, c.solutionSetup.connections);
        expect(res.success).toBe(true);
      });
    });
  });

});


