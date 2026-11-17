/**
 * pe-num.js - number helpers for PE items whose values change from run to run.
 *
 * A calculation item picks one row from a short table of vetted values with the run's random
 * stream, then builds its stem, options, hint and worked solution from that row. The tables
 * keep the numbers realistic and the answers tidy; the formulas keep every string in step.
 * services/__tests__/peDataKeys.test.ts runs each item over many draws.
 * Load before the data files (see index.html). Zero em-dash compliant.
 */
(function (global) {
  'use strict';

  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };

  /** One element of a list, chosen with the run's random stream. */
  function pick(rng, list) {
    const i = Math.min(list.length - 1, Math.floor(rng() * list.length));
    return list[i];
  }

  /** Fixed decimals, with thousands commas as the banks write them ("4,485", "2,510.4"). */
  function fix(x, decimals) {
    // Nudge halves up first: 0.5 x 44.01 is stored as 22.00499..., which toFixed(2) rounds down.
    const n = Number(x);
    const s = (n + Math.sign(n) * 1e-9).toFixed(decimals == null ? 0 : decimals);
    const neg = s.startsWith('-');
    const [whole, frac] = (neg ? s.slice(1) : s).split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-' : '') + grouped + (frac ? '.' + frac : '');
  }

  /** Scientific notation in the banks' style: "1.204 x 10²⁴" (four significant figures by default). */
  function sci(x, sig) {
    const digits = sig == null ? 4 : sig;
    const [mant, exp] = Number(x).toExponential(digits - 1).split('e');
    const e = String(parseInt(exp, 10)).split('').map(c => SUP[c]).join('');
    return `${mant} x 10${e}`;
  }

  /** Round to a number of decimals, as a number (for correctValue). */
  function round(x, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round((x + Math.sign(x) * 1e-9) * f) / f;
  }

  global.PE_NUM = { pick, fix, sci, round };
})(typeof window !== 'undefined' ? window : this);
