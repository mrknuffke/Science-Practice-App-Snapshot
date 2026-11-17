/**
 * Unicode Formatting Utilities
 * Shared utilities for converting numbers and text to subscript/superscript
 * Used across chemical formula displays, ion charges, and mathematical notation
 */

// Subscript character mappings
export const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
} as const;

// Superscript character mappings
export const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
} as const;

/**
 * Convert a number to subscript Unicode characters
 * @param num - The number to convert
 * @returns Unicode subscript string (e.g., 2 → "₂")
 * @example toSubscript(12) // "₁₂"
 */
export function toSubscript(num: number): string {
  if (num <= 1) return ''; // Don't show subscript for 1
  return num
    .toString()
    .split('')
    .map(digit => SUBSCRIPT_MAP[digit] || digit)
    .join('');
}

/**
 * Convert a number to superscript Unicode characters with optional sign
 * @param num - The number to convert (absolute value)
 * @param sign - Optional '+' or '-' sign to prepend
 * @returns Unicode superscript string (e.g., 2 with '+' → "²⁺")
 * @example toSuperscript(2, '+') // "²⁺"
 */
export function toSuperscript(num: number, sign?: '+' | '-'): string {
  const absNum = Math.abs(num);
  let result = absNum
    .toString()
    .split('')
    .map(digit => SUPERSCRIPT_MAP[digit] || digit)
    .join('');

  if (sign) {
    result += SUPERSCRIPT_MAP[sign];
  }

  return result;
}

/**
 * Format an ion charge as superscript
 * @param charge - The charge value (e.g., +2, -1)
 * @returns Formatted charge string (e.g., "²⁺", "⁻")
 * @example formatIonCharge(2) // "²⁺"
 * @example formatIonCharge(-1) // "⁻"
 */
export function formatIonCharge(charge: number): string {
  if (charge === 0) return '';

  const absCharge = Math.abs(charge);
  const sign = charge > 0 ? '+' : '-';

  // For charge of 1 or -1, only show sign (e.g., Na⁺, Cl⁻)
  if (absCharge === 1) {
    return SUPERSCRIPT_MAP[sign];
  }

  // For other charges, show number + sign (e.g., Ca²⁺, O²⁻)
  return toSuperscript(absCharge, sign);
}

/**
 * Format a chemical formula with subscripts
 * @param formula - Chemical formula string (e.g., "H2O", "Ca(OH)2")
 * @returns Formatted formula with Unicode subscripts
 * @example formatFormula("H2O") // "H₂O"
 * @example formatFormula("Ca(OH)2") // "Ca(OH)₂"
 */
export function formatFormula(formula: string): string {
  return formula.replace(/(\d+)/g, (match) => toSubscript(parseInt(match, 10)));
}

/**
 * Format scientific notation text (e.g., CO2 → CO₂)
 * Converts subscript tags or numbers following capital letters to Unicode subscripts
 * @param text - Text with scientific notation
 * @returns Formatted text with Unicode subscripts
 * @example formatScientificText("CO2") // "CO₂"
 * @example formatScientificText("H2SO4") // "H₂SO₄"
 */
export function formatScientificText(text: string): string {
  // Replace <sub>...</sub> tags with Unicode subscripts
  let formatted = text.replace(/<sub>(\d+)<\/sub>/g, (_, num) => toSubscript(parseInt(num, 10)));

  // Replace numbers following capital letters with subscripts
  formatted = formatted.replace(/([A-Z][a-z]?)(\d+)/g, (_, element, num) => {
    return element + toSubscript(parseInt(num, 10));
  });

  return formatted;
}

/**
 * Strip all subscript/superscript formatting from a string
 * @param text - Text with Unicode subscripts/superscripts
 * @returns Plain text with numbers
 * @example stripFormatting("H₂O") // "H2O"
 */
export function stripFormatting(text: string): string {
  let plain = text;

  // Replace subscripts with regular numbers
  Object.entries(SUBSCRIPT_MAP).forEach(([digit, subscript]) => {
    plain = plain.replace(new RegExp(subscript, 'g'), digit);
  });

  // Replace superscripts with regular numbers and signs
  Object.entries(SUPERSCRIPT_MAP).forEach(([char, superscript]) => {
    plain = plain.replace(new RegExp(superscript, 'g'), char);
  });

  return plain;
}
