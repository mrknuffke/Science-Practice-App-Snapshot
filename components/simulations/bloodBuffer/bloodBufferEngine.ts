export interface BloodBufferState {
  respRate: number; // breaths per minute (normal: 12-16, baseline 14)
  metabolicAcid: number; // -5 to +5 arbitrary mEq
  isBuffered: boolean;
  isRebreathing: boolean;
}

export type AcidBaseStatus =
  | 'normal'
  | 'acidosis'
  | 'alkalosis'
  | 'severe_acidosis'
  | 'severe_alkalosis';

export interface BloodBufferStatusInfo {
  text: string;
  color: string;
  status: AcidBaseStatus;
}

/**
 * Calculates arterial blood pH based on respiratory rate, metabolic disturbance, buffering, and rebreathing.
 * Baseline pH is 7.40 at respRate = 14 bpm and metabolicAcid = 0.
 */
export function calculateBloodPH(state: BloodBufferState): number {
  const bufferFactor = state.isBuffered ? 1 : 8.5;
  const effectiveRespRate = state.isRebreathing ? Math.min(state.respRate, 14) : state.respRate;
  const respDelta = (effectiveRespRate - 14) * 0.012 * bufferFactor;
  const metabolicDelta = -state.metabolicAcid * 0.04 * bufferFactor;

  const rawPh = 7.4 + respDelta + metabolicDelta;
  return Number(Math.max(6.8, Math.min(8.0, rawPh)).toFixed(2));
}

/**
 * Classifies blood pH into clinical homeostatic categories with design-token-compliant badges.
 */
export function classifyBloodStatus(ph: number): BloodBufferStatusInfo {
  if (ph < 7.35) {
    if (ph < 7.0) {
      return {
        text: 'Severe Acidosis (Life-Threatening)',
        color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 animate-pulse',
        status: 'severe_acidosis',
      };
    }
    return {
      text: 'Acidosis (pH < 7.35)',
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
      status: 'acidosis',
    };
  }
  if (ph > 7.45) {
    if (ph > 7.7) {
      return {
        text: 'Severe Alkalosis (Life-Threatening)',
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800 animate-pulse',
        status: 'severe_alkalosis',
      };
    }
    return {
      text: 'Alkalosis (pH > 7.45)',
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800',
      status: 'alkalosis',
    };
  }
  return {
    text: 'Normal Homeostatic Range (7.35 to 7.45)',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    status: 'normal',
  };
}

/**
 * Determines Le Chatelier shift direction in the bicarbonate equation:
 * CO2 + H2O ⇄ H2CO3 ⇄ H+ + HCO3-
 */
export function getLeChatelierShift(
  respRate: number,
  metabolicAcid: number,
  currentPH: number
): 'left' | 'right' | 'balanced' {
  if (currentPH < 7.35) return 'right';
  if (currentPH > 7.45) return 'left';
  return 'balanced';
}
