import { ChallengeDef } from '../shared/ChallengeDeck';
import { BloodBufferState, calculateBloodPH } from './bloodBufferEngine';

export type ClinicalDiagnosis =
  | 'metabolic_acidosis'
  | 'respiratory_acidosis'
  | 'metabolic_alkalosis'
  | 'respiratory_alkalosis';

export interface BloodBufferSetup extends BloodBufferState {
  diagnosis?: ClinicalDiagnosis;
}

export interface BloodBufferChallenge extends ChallengeDef {
  patientHistory: string;
  expectedDiagnosis: ClinicalDiagnosis;
  start: BloodBufferSetup;
  solutionSetup: BloodBufferSetup & { diagnosis: ClinicalDiagnosis };
}

export const BLOOD_BUFFER_CHALLENGES: BloodBufferChallenge[] = [
  {
    id: 'dka_acidosis',
    title: 'Clinical Case 1: Diabetic Ketoacidosis (DKA)',
    description:
      'A 24-year-old patient with missed insulin presents with severe arterial acidosis (pH < 7.25) from metabolic ketone accumulation. Diagnose the disturbance and compensate via respiratory drive to restore arterial pH to the 7.35 to 7.45 safe corridor.',
    hints: [
      'Examine the cause of the acid: ketones are organic metabolic acids produced by fatty acid breakdown, not dissolved carbon dioxide.',
      'Metabolic acids add excess H⁺, driving the equilibrium rightward. To compensate, the respiratory center stimulates deep, rapid breathing (Kussmaul breathing) to blow off CO₂.',
      'Select Metabolic Acidosis, then increase the Respiratory Rate slider toward 27 bpm to blow off CO₂ until arterial pH returns to 7.40.',
    ],
    solution:
      'Diagnosed Metabolic Acidosis. Compensated by increasing respiratory rate to 27 bpm (blowing off CO₂), shifting equilibrium left and restoring pH to 7.40.',
    patientHistory: 'Type 1 diabetic missing insulin doses; acute ketone accumulation in blood.',
    expectedDiagnosis: 'metabolic_acidosis',
    start: {
      respRate: 14,
      metabolicAcid: 4,
      isBuffered: true,
      isRebreathing: false,
    },
    solutionSetup: {
      respRate: 27,
      metabolicAcid: 4,
      isBuffered: true,
      isRebreathing: false,
      diagnosis: 'metabolic_acidosis',
    },
  },
  {
    id: 'panic_alkalosis',
    title: 'Clinical Case 2: Panic Attack Hyperventilation',
    description:
      'A 19-year-old student having an acute panic attack breathes at 32 breaths/min, developing lightheadedness and arterial alkalosis (pH > 7.60). Diagnose the etiology and deploy an intervention to bring pH back into the 7.35 to 7.45 homeostatic window.',
    hints: [
      'Why does breathing too rapidly at rest cause blood pH to rise into the dangerous alkalosis corridor?',
      'Excessive ventilation blows off CO₂ faster than tissues generate it, pulling equilibrium to the left and depleting H⁺ (Respiratory Alkalosis). Trapping exhaled gas allows alveolar CO₂ to re-accumulate.',
      'Select Respiratory Alkalosis, then activate the Rebreathing Mask toggle (or reduce respiratory rate back to 14 bpm) to restore dissolved CO₂ and return pH to 7.40.',
    ],
    solution:
      'Diagnosed Respiratory Alkalosis. Applied the rebreathing mask to trap exhaled CO₂, shifting equilibrium rightward and returning arterial pH to 7.40.',
    patientHistory: 'Acute anxiety panic attack; rapid tachypneic breathing without physical exertion.',
    expectedDiagnosis: 'respiratory_alkalosis',
    start: {
      respRate: 32,
      metabolicAcid: 0,
      isBuffered: true,
      isRebreathing: false,
    },
    solutionSetup: {
      respRate: 32,
      metabolicAcid: 0,
      isBuffered: true,
      isRebreathing: true,
      diagnosis: 'respiratory_alkalosis',
    },
  },
  {
    id: 'sedation_hypovent',
    title: 'Clinical Case 3: Post-Operative Respiratory Depression',
    description:
      'A patient recovering from anesthesia has severely depressed respiratory drive (5 breaths/min). Retained CO₂ drives arterial pH down to 7.29. Accurately diagnose the condition and restore physiological homeostatic pH.',
    hints: [
      'What happens to blood gas equilibrium when breathing becomes abnormally shallow and slow?',
      'Hypoventilation prevents CO₂ exhalation. Dissolved CO₂ builds up, pushing equilibrium right to form excess carbonic acid and H⁺ ions (Respiratory Acidosis).',
      'Select Respiratory Acidosis, then assist ventilation by increasing Respiratory Rate back to resting normal (13 to 15 bpm) to blow off trapped CO₂.',
    ],
    solution:
      'Diagnosed Respiratory Acidosis. Assisted ventilation to restore normal resting respiratory rate (14 bpm), eliminating trapped CO₂ and restoring pH to 7.40.',
    patientHistory: 'Post-operative sedative overdose leading to slow, shallow breaths.',
    expectedDiagnosis: 'respiratory_acidosis',
    start: {
      respRate: 5,
      metabolicAcid: 0,
      isBuffered: true,
      isRebreathing: false,
    },
    solutionSetup: {
      respRate: 14,
      metabolicAcid: 0,
      isBuffered: true,
      isRebreathing: false,
      diagnosis: 'respiratory_acidosis',
    },
  },
  {
    id: 'vomiting_alkalosis',
    title: 'Clinical Case 4: Severe Gastric Acid Loss',
    description:
      'A patient with persistent gastric illness suffers severe loss of stomach hydrochloric acid (HCl), driving arterial pH up to 7.56. Identify the disturbance and use respiratory compensation to return pH to safe levels.',
    hints: [
      'If the body loses stomach acid (HCl), how does the blood buffer equilibrium react to missing H⁺ ions?',
      'Losing stomach acid causes Metabolic Alkalosis. To compensate, the respiratory center slows breathing (hypoventilation) to retain CO₂, replenishing carbonic acid and H⁺.',
      'Select Metabolic Alkalosis, then decrease the Respiratory Rate slider toward 5 to 6 bpm to retain CO₂ until pH descends back into the green homeostatic corridor.',
    ],
    solution:
      'Diagnosed Metabolic Alkalosis. Compensated by reducing respiratory rate to 5 bpm to retain metabolic CO₂, pushing equilibrium right and returning pH to 7.45.',
    patientHistory: 'Prolonged gastric illness with loss of stomach acid.',
    expectedDiagnosis: 'metabolic_alkalosis',
    start: {
      respRate: 14,
      metabolicAcid: -4,
      isBuffered: true,
      isRebreathing: false,
    },
    solutionSetup: {
      respRate: 5,
      metabolicAcid: -4,
      isBuffered: true,
      isRebreathing: false,
      diagnosis: 'metabolic_alkalosis',
    },
  },
];

/**
 * Validates clinical challenge state against physiological targets.
 */
export function verifyBloodBufferChallenge(
  challenge: BloodBufferChallenge,
  state: BloodBufferState,
  diagnosis: string
): { success: boolean; message: string } {
  if (!diagnosis) {
    return { success: false, message: 'Please select a clinical diagnosis first.' };
  }
  if (diagnosis !== challenge.expectedDiagnosis) {
    return {
      success: false,
      message: `Diagnosis mismatch. Re-evaluate the underlying cause: ${challenge.patientHistory}`,
    };
  }

  const currentPH = calculateBloodPH(state);
  const isPhSafe = currentPH >= 7.35 && currentPH <= 7.45;
  if (!isPhSafe) {
    return {
      success: false,
      message: `Your diagnosis of ${challenge.expectedDiagnosis.replace(/_/g, ' ')} is spot on, but arterial pH is still ${currentPH.toFixed(2)}. Adjust the breathing rate to bring pH back into the safe 7.35 to 7.45 range.`,
    };
  }

  return {
    success: true,
    message: `You diagnosed ${challenge.expectedDiagnosis.replace(/_/g, ' ')} correctly and stabilized the patient's arterial pH at ${currentPH.toFixed(2)}.`,
  };
}
