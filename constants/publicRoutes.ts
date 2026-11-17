// Single source of truth for the routes that are reachable WITHOUT Google sign-in.
//
// App.tsx builds shareable `?page=` URLs from VIEW_TO_PAGE; the preflight route
// checker (scripts/preflight/check-routes.mjs) requests every page this file
// produces. A drift guard in services/__tests__/sourceOfTruth.test.ts asserts
// the two stay in step, and that every simulation in SIMULATIONS_REGISTRY has a
// page here — so a new simulation cannot ship without a public route check.
import { ViewType } from '../types';

/** Info pages: public because the app must explain itself before you sign in. */
export const INFO_PAGES = [
  'how_it_works',
  'features',
  'support',
  'teachers',
  'changelog',
  'open_resources',
] as const;

/**
 * Every view that gets a `?page=` URL. Info pages are public reading;
 * simulations are always shareable, signed in or not.
 */
export const VIEW_TO_PAGE: Partial<Record<ViewType, string>> = {
  how_it_works: 'how_it_works',
  features: 'features',
  support: 'support',
  teachers: 'teachers',
  reflection: 'reflection',
  changelog: 'changelog',
  open_resources: 'resources',
  simulations_hub: 'interactives',
  covalent_bonding: 'covalent_bonding',
  ionic_bonding: 'ionic_bonding',
  periodic_table: 'periodic_table',
  build_an_atom: 'build_an_atom',
  ecosystem_simulation: 'ecosystem_simulation',
  population_genetics: 'population_genetics',
  phase_change: 'phase_change',
  regulatory_modeler: 'regulatory_modeler',
  diffusion_simulation: 'diffusion',
  reaction_kinetics_simulation: 'reaction_kinetics',
  gas_laws: 'gas_laws',
  free_body_diagram: 'free_body_diagram',
  motion_tracker: 'video-lab',
  calorimetry: 'calorimetry',
  blood_buffer: 'blood_buffer',
  nuclear_decay: 'nuclear_decay',
  osmosis_lab: 'osmosis',
  carbon_journey: 'carbon_atom',
  island_biogeography: 'island_biogeography',
  concept_map: 'concept_map',
  diagram_labeling: 'diagram_labeling',
  skeptic: 'skeptic',
  tutor: 'tutor',
  socratic: 'socratic',
  growth_coach: 'growth_coach',
  vocab_relay: 'vocab_relay',
};

/**
 * Views that carry a `?page=` but still sit behind sign-in, so the route
 * checker must not expect them to render for a signed-out visitor.
 * `reflection` is a Teacher Tool.
 */
export const AUTHENTICATED_ONLY_PAGES = ['reflection'] as const;

/** Exactly the `?page=` values a signed-out visitor can open. */
export const PUBLIC_PAGE_PARAMS: string[] = Object.values(VIEW_TO_PAGE)
  .filter((p): p is string => typeof p === 'string')
  .filter((p) => !(AUTHENTICATED_ONLY_PAGES as readonly string[]).includes(p))
  .sort();
