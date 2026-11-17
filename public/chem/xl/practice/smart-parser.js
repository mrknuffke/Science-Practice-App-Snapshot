/**
 * smart-parser.js - XL Chemistry Smart Input Parser & Evaluator
 * Handles scientific notation, powers of 10, unit extraction,
 * live KaTeX preview generation, and diagnostic error analysis.
 *
 * Strict Zero Em-Dashes Invariant observed.
 */

(function (global) {
  'use strict';

  const SmartParser = {
    /**
     * Clean and normalize raw user text
     */
    normalize(str) {
      if (!str) return '';
      return str
        .trim()
        .replace(/[\u2013\u2014]/g, '-') // replace any unicode dashes with hyphen
        .replace(/\s+/g, ' ')
        .replace(/×/g, 'x')
        .replace(/·/g, 'x')
        .replace(/\*/g, 'x');
    },

    /**
     * Parse scientific notation and units from input string.
     * Handles:
     *   "5.18e-7 m"
     *   "5.18 x 10^-7 m"
     *   "5.18*10^-7 m"
     *   "5.18 x 10-7 m"
     *   "35.45 amu"
     *   "4.65E14 s^-1"
     */
    parse(rawInput) {
      const clean = this.normalize(rawInput);
      if (!clean) {
        return { isValid: false, isEmpty: true, message: 'Please enter a value.' };
      }

      // 1. Regex for: [mantissa] (x 10^ [exponent] | e [exponent])? [units]?
      const sciRegex = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*(?:x|X)\s*10\s*(?:\^|\*\*)?\s*([+-]?\d+)|\s*[eE]([+-]?\d+))?(?:\s+(.+)|$)/;

      const match = clean.match(sciRegex);

      if (!match) {
        // Check if there is just a number followed immediately by a unit without space (e.g. "5.18m", "35.45amu", "75.4%")
        const attachedRegex = /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))([a-zA-Z°/%]+.*)$/;
        const attMatch = clean.match(attachedRegex);
        if (attMatch) {
          const numVal = parseFloat(attMatch[1]);
          const unit = attMatch[2].trim();
          return {
            isValid: true,
            raw: rawInput,
            value: numVal,
            mantissa: numVal,
            exponent: 0,
            unit: unit,
            latex: this.toLatex(numVal, 0, unit)
          };
        }

        return {
          isValid: false,
          isEmpty: false,
          errorType: 'unrecognized_format',
          message: 'Unable to recognize number format. Example: 3.45 x 10^-2 g'
        };
      }

      const mantissaStr = match[1];
      const expStr = match[2] || match[3] || null;
      let unitStr = (match[4] || '').trim();

      const mantissa = parseFloat(mantissaStr);
      if (isNaN(mantissa)) {
        return {
          isValid: false,
          errorType: 'invalid_number',
          message: 'Invalid numeric value.'
        };
      }

      let exponent = 0;
      if (expStr !== null) {
        exponent = parseInt(expStr, 10);
        if (isNaN(exponent)) {
          return {
            isValid: false,
            errorType: 'invalid_exponent',
            message: 'Invalid exponent value.'
          };
        }
      }

      // Compute float value
      const value = mantissa * Math.pow(10, exponent);

      return {
        isValid: true,
        raw: rawInput,
        value: value,
        mantissa: mantissa,
        exponent: exponent,
        unit: unitStr,
        latex: this.toLatex(mantissa, exponent, unitStr)
      };
    },

    /**
     * Generate LaTeX representation for KaTeX preview
     */
    toLatex(mantissa, exponent, unit) {
      let latex = '';
      if (exponent !== 0) {
        latex = `${mantissa} \\times 10^{${exponent}}`;
      } else {
        latex = `${mantissa}`;
      }

      if (unit) {
        let cleanUnit = unit
          .replace(/\^(\d+)/g, '^{$1}')
          .replace(/\^(-?\d+)/g, '^{$1}')
          .replace(/s\^-1/g, '\\text{s}^{-1}')
          .replace(/s-1/g, '\\text{s}^{-1}')
          .replace(/s\^\{ -1\}/g, '\\text{s}^{-1}');

        latex += `\\;\\text{${cleanUnit}}`;
      }

      return latex;
    },

    /**
     * Standardize unit strings for comparison
     */
    normalizeUnit(unit) {
      if (!unit) return '';
      let u = unit.toLowerCase().trim();
      if (/^([a-z0-9]+\s+)?atoms?(\s+of\s+[a-z0-9]+)?$/i.test(u)) return 'atoms';
      if (/^([a-z0-9]+\s+)?molecules?(\s+of\s+[a-z0-9]+)?$/i.test(u)) return 'molecules';
      if (/^(electrons?|e-?)$/i.test(u)) return 'electrons';
      if (/^(degrees?|deg|°)$/i.test(u)) return 'deg';
      return u
        .replace(/\s+/g, '')
        .replace(/joules?\/mol|j\/mols?/g, 'j/mol')
        .replace(/kilojoules?\/mol|kj\/mols?/g, 'kj/mol')
        .replace(/kilojoules?|kj/g, 'kj')
        .replace(/joules?/g, 'j')
        .replace(/meters?/g, 'm')
        .replace(/hertz/g, 'hz')
        .replace(/sec(?:ond)?s?/g, 's')
        .replace(/s\^-1/g, 'hz')
        .replace(/1\/s/g, 'hz')
        .replace(/amu/g, 'amu')
        .replace(/grams?\/mol|g\/mols?/g, 'g/mol')
        .replace(/grams?/g, 'g')
        .replace(/\b(moles?|mols?)\b/g, 'mol')
        .replace(/milliliters?|ml/g, 'ml')
        .replace(/\b(liters?|litres?)\b/g, 'l')
        .replace(/percent|pct/g, '%');
    },

    /**
     * Count significant figures in a mantissa string
     */
    countSigFigs(mantissaStr) {
      const s = mantissaStr.replace(/^[+-]/, '');
      if (!s.includes('.')) {
        const trimmed = s.replace(/^0+/, '');
        return trimmed.length;
      }
      const stripped = s.replace('.', '').replace(/^0+/, '');
      return stripped.length;
    },

    /**
     * Evaluate parsed student answer against expected parameters
     */
    evaluate(parsed, expected) {
      if (!parsed || !parsed.isValid) {
        return {
          status: 'invalid',
          score: 0,
          feedback: parsed ? parsed.message : 'Please enter an answer.'
        };
      }

      const tolerance = expected.tolerance !== undefined ? expected.tolerance : 0.02; // default 2%
      const studentVal = parsed.value;
      const targetVal = expected.value;

      // 1. Check unit if expected
      if (expected.unit) {
        const studentUnitNorm = this.normalizeUnit(parsed.unit);
        const expectedUnitNorm = this.normalizeUnit(expected.unit);

        if (!studentUnitNorm) {
          return {
            status: 'missing_unit',
            score: 0,
            feedback: `Missing units. Please include expected units (${expected.unit}).`
          };
        }

        if (studentUnitNorm !== expectedUnitNorm) {
          if (
            (studentUnitNorm === 'nm' && expectedUnitNorm === 'm') ||
            (studentUnitNorm === 'm' && expectedUnitNorm === 'nm')
          ) {
            return {
              status: 'unit_conversion_error',
              score: 0,
              feedback: 'Check your unit prefixes: remember that 1 meter = 10^9 nanometers.'
            };
          }

          return {
            status: 'wrong_unit',
            score: 0,
            feedback: `Incorrect unit: supplied "${parsed.unit}", expected "${expected.unit}".`
          };
        }
      }

      // 2. Check magnitude / value
      if (targetVal === 0) {
        if (Math.abs(studentVal) > 1e-6) {
          return {
            status: 'incorrect',
            score: 0,
            feedback: 'Calculation does not match expected result.'
          };
        }
      } else {
        const relativeDiff = Math.abs((studentVal - targetVal) / targetVal);

        const ratio = studentVal / targetVal;
        if (Math.abs(ratio - 10) < 0.1 || Math.abs(ratio - 0.1) < 0.01) {
          return {
            status: 'factor_of_10',
            score: 0,
            feedback: 'You are off by a factor of 10. Check your decimal or exponent arithmetic.'
          };
        }
        if (Math.abs(ratio - 100) < 1 || Math.abs(ratio - 0.01) < 0.001) {
          return {
            status: 'percent_error',
            score: 0,
            feedback: 'You are off by a factor of 100. Did you remember to convert percentages to decimal fractions?'
          };
        }
        if (Math.abs(ratio - 1000) < 10 || Math.abs(ratio - 0.001) < 0.0001) {
          return {
            status: 'metric_prefix_error',
            score: 0,
            feedback: 'You are off by a factor of 1,000. Double check your metric prefix conversion.'
          };
        }

        if (studentVal * targetVal < 0) {
          return {
            status: 'sign_error',
            score: 0,
            feedback: 'Check the sign of your answer (+ vs -).'
          };
        }

        if (relativeDiff > tolerance) {
          return {
            status: 'incorrect',
            score: 0,
            feedback: 'Calculation does not match expected value within acceptable tolerance.'
          };
        }
      }

      let sigFigWarning = null;
      if (expected.sigFigs && parsed.mantissa) {
        const suppliedFigs = this.countSigFigs(parsed.mantissa.toString());
        if (Math.abs(suppliedFigs - expected.sigFigs) > 1) {
          sigFigWarning = `Note: Expected approximately ${expected.sigFigs} significant figures (you provided ${suppliedFigs}).`;
        }
      }

      return {
        status: 'correct',
        score: 1,
        feedback: 'Correct! Excellent calculation.',
        sigFigWarning: sigFigWarning
      };
    }
  };

  global.SmartParser = SmartParser;
})(typeof window !== 'undefined' ? window : this);
