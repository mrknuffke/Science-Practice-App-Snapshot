import { ChallengeDef } from '../shared/ChallengeDeck';
import { MembraneKind, TubeWidth } from './osmosisEngine';

export interface OsmosisSetup {
  bagConc: number;
  beakerConc: number;
  tube: TubeWidth;
  membrane: MembraneKind;
}

/** What the sim knows about the current run when a student presses Verify. */
export interface OsmosisRunState {
  setup: OsmosisSetup;
  heightMm: number;
  rateMmPerMin: number;
  peakMm: number;
  elapsed: number;
  previous: OsmosisSetup | null;
}

export interface OsmosisChallenge extends ChallengeDef {
  start: OsmosisSetup;
  solutionSetup: OsmosisSetup;
  check: (_run: OsmosisRunState) => { success: boolean; message: string };
}

const BLANK: OsmosisSetup = { bagConc: 0, beakerConc: 0, tube: 'medium', membrane: 'ideal' };
const settled = (run: OsmosisRunState) => Math.abs(run.rateMmPerMin) < 0.3;
const mm = (n: number) => `${n.toFixed(0)} mm`;

export const OSMOSIS_CHALLENGES: OsmosisChallenge[] = [
  {
    id: 'climb',
    title: 'Make it climb',
    description: 'Set up the bag and the beaker so the column climbs at least 50 mm above the start line.',
    hints: [
      'Water moves toward the side with more dissolved sugar.',
      'Put the sugar inside the bag. Leave the beaker as pure water.',
      'Set the bag to 0.8 M or more and the beaker to 0 M. Press Start.',
    ],
    solution: 'Bag 1.0 M, beaker 0 M. Water moves into the sugary bag and pushes the column up.',
    start: BLANK,
    solutionSetup: { ...BLANK, bagConc: 1 },
    check: run => {
      if (run.heightMm >= 50) {
        return { success: true, message: `The column reached ${mm(run.heightMm)}. More sugar inside means less free water inside, so more water crosses in than out.` };
      }
      if (run.heightMm < -1) {
        return { success: false, message: 'The column is falling, so water is leaving the bag. Which side needs the extra sugar for water to move in?' };
      }
      if (run.elapsed > 5 && settled(run)) {
        return { success: false, message: `It stopped at ${mm(run.heightMm)}. A bigger sugar difference gives a taller final column.` };
      }
      return { success: false, message: 'Not at 50 mm yet. Press Start, speed up time, or make the sugar difference bigger.' };
    },
  },
  {
    id: 'sink',
    title: 'Make it sink',
    description: 'Get the column to drop at least 30 mm below the start line.',
    hints: [
      'The column falls when water leaves the bag.',
      'Water leaves when the beaker has more sugar than the bag.',
      'Set the bag to 0 M and the beaker to 0.6 M. Press Start.',
    ],
    solution: 'Bag 0 M, beaker 0.6 M. The beaker has less free water, so more water leaves the bag than enters it.',
    start: BLANK,
    solutionSetup: { ...BLANK, beakerConc: 0.6 },
    check: run => {
      if (run.heightMm <= -30) {
        return { success: true, message: `The column fell to ${mm(run.heightMm)}. The sugar is outside now, so water moves out of the bag.` };
      }
      if (run.heightMm > 1) {
        return { success: false, message: 'The column is rising. Most people put the sugar in the bag here. For water to leave, the sugar goes outside.' };
      }
      return { success: false, message: 'Not 30 mm down yet. Give the beaker more sugar than the bag, then let it run.' };
    },
  },
  {
    id: 'balance',
    title: 'Find the stopping point',
    description: 'Run a sugar bag in pure water until the column stops moving. It must stop above 40 mm.',
    hints: [
      'A column that stops is not a column with no water moving.',
      'Use a bag of 0.6 M or more in pure water. Set the speed to 20×.',
      'Wait until the graph goes flat and the speed reads close to 0.',
    ],
    solution: 'Bag 1.0 M, beaker 0 M, run at 20× until the graph is flat near 94 mm.',
    start: { ...BLANK, bagConc: 0.8 },
    solutionSetup: { ...BLANK, bagConc: 1 },
    check: run => {
      if (run.heightMm >= 40 && settled(run)) {
        return { success: true, message: `It stopped at ${mm(run.heightMm)}. The column's weight now pushes water out as hard as osmosis moves it in. Check the close-up: water still crosses both ways, in equal numbers.` };
      }
      if (!settled(run)) {
        return { success: false, message: `Still moving at ${Math.abs(run.rateMmPerMin).toFixed(1)} mm per minute. Speed up time and wait for the graph to go flat.` };
      }
      return { success: false, message: `It stopped at ${mm(run.heightMm)}, below 40 mm. A bigger sugar difference needs a taller column to balance it.` };
    },
  },
  {
    id: 'tubes',
    title: 'Narrow tube or wide tube?',
    description: 'Run a 1.0 M bag in pure water with the wide tube. Then reset and repeat it with the narrow tube.',
    hints: [
      'Reset keeps your last run on the graph as a dashed line.',
      'Change only the tube between the two runs. Keep both solutions the same.',
      'Wide tube, 1.0 M bag, 0 M beaker. Run 60 seconds. Pick Narrow, which starts a new run. Run 60 seconds again.',
    ],
    solution: 'Run 1 used the wide tube, run 2 the narrow tube, both 1.0 M in pure water. Compare the two lines on the graph.',
    start: { ...BLANK, bagConc: 1, tube: 'wide' },
    solutionSetup: { ...BLANK, bagConc: 1, tube: 'narrow' },
    check: run => {
      const prev = run.previous;
      if (!prev || prev.tube !== 'wide') {
        return { success: false, message: 'Your last run needs to use the wide tube. Run it first, then switch to Narrow.' };
      }
      if (run.setup.tube !== 'narrow') {
        return { success: false, message: 'Now switch to the narrow tube for this run.' };
      }
      if (prev.bagConc !== run.setup.bagConc || prev.beakerConc !== run.setup.beakerConc) {
        return { success: false, message: 'Change only the tube. Your two runs used different solutions, so the test is not fair.' };
      }
      if (run.elapsed < 30) {
        return { success: false, message: 'Let this run go at least 30 seconds so the two lines are easy to compare.' };
      }
      return { success: true, message: "The narrow tube climbs much faster. The same small volume of water makes a taller column in a thin tube. Both head for a similar height, because the column's weight depends on its height, not its width. The wide tube ends a little lower: it holds more water, which dilutes the bag more." };
    },
  },
  {
    id: 'leaky',
    title: 'Real dialysis tubing',
    description: 'Switch to the leaky membrane. Run a sugar bag in pure water until the column rises, then starts to fall.',
    hints: [
      'Real dialysis tubing lets small molecules like sugar through, slowly.',
      'Pick Leaky membrane, a 1.0 M bag and a 0 M beaker. Use 20× speed.',
      'Watch the sugar reading for the bag. When it drops far enough, the column turns around.',
    ],
    solution: 'Leaky membrane, bag 1.0 M, beaker 0 M, run at 20× for about 15 seconds.',
    start: { ...BLANK, bagConc: 1, membrane: 'leaky' },
    solutionSetup: { ...BLANK, bagConc: 1, membrane: 'leaky' },
    check: run => {
      if (run.setup.membrane !== 'leaky') {
        return { success: false, message: 'Switch to the leaky membrane first. The perfect membrane never lets sugar out.' };
      }
      if (run.peakMm >= 30 && run.rateMmPerMin < -0.2) {
        return { success: true, message: `It peaked at ${mm(run.peakMm)} and is falling now. Sugar leaked out, so the sugar difference shrank. Osmosis got weaker and the column's weight won.` };
      }
      if (run.peakMm < 30) {
        return { success: false, message: 'The column has not climbed 30 mm yet. Use a sugary bag in pure water and let it run.' };
      }
      return { success: false, message: `It reached ${mm(run.peakMm)} but is not falling yet. Keep it running and watch the bag's sugar reading.` };
    },
  },
];
