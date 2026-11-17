/**
 * Osmometer model: a dialysis-tubing bag of sugar solution in a beaker, with a
 * glass tube rising out of the bag.
 *
 * Water flow follows J = Lp × (osmotic drive − column back-pressure), the same
 * relationship as the original sim, with two fixes:
 *  - The solute is sucrose, not NaCl. Real dialysis tubing passes NaCl freely.
 *  - The bag dilutes as water enters, and the column's weight pushes back.
 *
 * Scale: real osmotic pressures would hold a column many metres tall. The
 * model shrinks the drive to PRESSURE_MM_PER_M so students can watch the column
 * level off inside a 13 cm tube. The About panel says so.
 */

export type MembraneKind = 'ideal' | 'leaky';

export type TubeWidth = 'narrow' | 'medium' | 'wide';

export const TUBE_RADIUS_MM: Record<TubeWidth, number> = {
  narrow: 0.5,
  medium: 1.0,
  wide: 1.5,
};

/** Starting volume of solution inside the bag. */
export const BAG_VOLUME_ML = 5;
/** Column height (mm) that balances a 1.0 M sugar difference. Scaled down from reality. */
export const PRESSURE_MM_PER_M = 100;
/** Water permeability: mm³ of water per second per mm of net drive. */
export const WATER_PERMEABILITY = 0.08;
/** Sugar leak through dialysis tubing: mL per second (flux = rate × concentration difference). */
export const SUGAR_LEAK_RATE = 0.03;
/** Column limits, in mm above (+) or below (−) the beaker surface. */
export const MAX_HEIGHT_MM = 130;
export const MIN_HEIGHT_MM = -110;

export interface OsmosisParams {
  beakerConc: number; // mol/L sucrose outside the bag
  tube: TubeWidth;
  membrane: MembraneKind;
}

export interface OsmosisState {
  time: number; // simulated seconds
  heightMm: number; // meniscus height relative to the beaker surface
  sugarMmol: number; // sucrose inside the bag
}

export interface OsmosisReadout {
  bagConc: number; // mol/L inside the bag right now
  osmosisDriveMm: number; // + moves water into the bag
  columnDriveMm: number; // + moves water into the bag (negative when the column is above the surface)
  netDriveMm: number;
  rateMmPerMin: number; // column speed
}

export const tubeAreaMm2 = (tube: TubeWidth): number => Math.PI * TUBE_RADIUS_MM[tube] ** 2;

export const bagVolumeMl = (state: OsmosisState, tube: TubeWidth): number =>
  BAG_VOLUME_ML + (tubeAreaMm2(tube) * state.heightMm) / 1000;

export const bagConcentration = (state: OsmosisState, tube: TubeWidth): number =>
  state.sugarMmol / bagVolumeMl(state, tube);

export const initialState = (bagConc: number): OsmosisState => ({
  time: 0,
  heightMm: 0,
  sugarMmol: bagConc * BAG_VOLUME_ML,
});

export function readout(state: OsmosisState, params: OsmosisParams): OsmosisReadout {
  const bagConc = bagConcentration(state, params.tube);
  const osmosisDriveMm = PRESSURE_MM_PER_M * (bagConc - params.beakerConc);
  const columnDriveMm = -state.heightMm;
  const netDriveMm = osmosisDriveMm + columnDriveMm;
  const volumeRate = WATER_PERMEABILITY * netDriveMm; // mm³/s
  const rateMmPerMin = (volumeRate / tubeAreaMm2(params.tube)) * 60;
  return { bagConc, osmosisDriveMm, columnDriveMm, netDriveMm, rateMmPerMin };
}

const MAX_SUBSTEP_S = 0.05;

/** Advance the model by dt simulated seconds. Pure: returns a new state. */
export function step(state: OsmosisState, params: OsmosisParams, dt: number): OsmosisState {
  let { time, heightMm, sugarMmol } = state;
  const area = tubeAreaMm2(params.tube);
  let remaining = dt;
  while (remaining > 1e-9) {
    const h = Math.min(MAX_SUBSTEP_S, remaining);
    const volume = BAG_VOLUME_ML + (area * heightMm) / 1000;
    const bagConc = sugarMmol / volume;
    const net = PRESSURE_MM_PER_M * (bagConc - params.beakerConc) - heightMm;
    heightMm += ((WATER_PERMEABILITY * net) / area) * h;
    heightMm = Math.min(MAX_HEIGHT_MM, Math.max(MIN_HEIGHT_MM, heightMm));
    if (params.membrane === 'leaky') {
      sugarMmol -= SUGAR_LEAK_RATE * (bagConc - params.beakerConc) * h;
      sugarMmol = Math.max(0, sugarMmol);
    }
    time += h;
    remaining -= h;
  }
  return { time, heightMm, sugarMmol };
}
