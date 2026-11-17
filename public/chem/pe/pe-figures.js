/**
 * Figure helpers for PE practice items (Lewis structures, particle boxes, energy profiles,
 * fatty-acid chains). A data file builds an SVG string with these and puts it in an item's
 * `figure`, which pe-engine.js draws under the stem without the glossary rewriter.
 * Drawing style follows lesson 1-2b; colours are the --pe-* tokens, so figures follow dark mode.
 * Load before the data files (see index.html). Zero em-dash compliant.
 */
(function() {
  'use strict';

  const INK = 'var(--pe-ink)';
  const MUTE = 'var(--pe-ink-mute)';
  const PULL = 'var(--pe-primary)'; // the atom that pulls harder, and its lone pairs

  function svg(width, height, aria, body) {
    return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${aria}">${body}</svg>`;
  }

  function label(x, y, text, bold, anchor) {
    return `<text x="${x}" y="${y}" font-family="var(--font-display)" font-size="14" font-weight="${bold ? 700 : 400}" fill="${bold ? INK : MUTE}" text-anchor="${anchor || 'middle'}">${text}</text>`;
  }

  // Larger mono text for equation pieces: coefficients, plus signs.
  function sign(x, y, text) {
    return `<text x="${x}" y="${y}" font-family="var(--font-mono)" font-weight="700" font-size="22" fill="${MUTE}" text-anchor="middle" dominant-baseline="central">${text}</text>`;
  }

  function arrow(x1, x2, y) {
    return `<line x1="${x1}" y1="${y}" x2="${x2 - 8}" y2="${y}" stroke="${MUTE}" stroke-width="2.2"/><path d="M${x2 - 10} ${y - 6} L${x2} ${y} L${x2 - 10} ${y + 6} Z" fill="${MUTE}"/>`;
  }

  function divider(x, height) {
    return `<line x1="${x}" y1="12" x2="${x}" y2="${height - 12}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 3"/>`;
  }

  function hDivider(y, width) {
    return `<line x1="12" y1="${y}" x2="${width - 12}" y2="${y}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 3"/>`;
  }

  function atom(x, y, sym, color) {
    return `<text x="${x}" y="${y}" font-family="var(--font-mono)" font-weight="700" font-size="22" fill="${color || INK}" text-anchor="middle" dominant-baseline="central">${sym}</text>`;
  }

  function bond(x1, y1, x2, y2) {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  }

  function doubleBond(x1, x2, y) {
    return bond(x1, y - 4, x2, y - 4) + bond(x1, y + 4, x2, y + 4);
  }

  function tripleBond(x1, x2, y) {
    return bond(x1, y - 6, x2, y - 6) + bond(x1, y, x2, y) + bond(x1, y + 6, x2, y + 6);
  }

  // A lone pair beside an atom. Wide atoms (Cl) sit their east and west pairs further out.
  function pair(x, y, side, wide) {
    const ew = wide ? 23 : 18;
    const offsets = { n: [0, -17, 5, 0], s: [0, 17, 5, 0], e: [ew, 0, 0, 5], w: [-ew, 0, 0, 5], nw: [-14, -14, 3.5, -3.5], ne: [14, -14, 3.5, 3.5] };
    const [dx, dy, px, py] = offsets[side];
    const cx = x + dx;
    const cy = y + dy;
    return `<circle cx="${cx - px}" cy="${cy - py}" r="2.4" fill="${PULL}"/><circle cx="${cx + px}" cy="${cy + py}" r="2.4" fill="${PULL}"/>`;
  }

  function pairs(x, y, sides, wide) {
    return sides.map(s => pair(x, y, s, wide)).join('');
  }

  function chlorine(x, y, sides) {
    return atom(x, y, 'Cl', PULL) + pairs(x, y, sides, true);
  }

  // ---- Molecules, each drawn around a centre point (cx, cy) ----
  function co2(cx, cy) {
    return doubleBond(cx - 36, cx - 12, cy) + doubleBond(cx + 12, cx + 36, cy) +
      atom(cx - 48, cy, 'O', PULL) + atom(cx, cy, 'C') + atom(cx + 48, cy, 'O', PULL) +
      pairs(cx - 48, cy, ['n', 's']) + pairs(cx + 48, cy, ['n', 's']);
  }

  function h2o(cx, cy) {
    return bond(cx - 10, cy - 6, cx - 30, cy + 10) + bond(cx + 10, cy - 6, cx + 30, cy + 10) +
      atom(cx, cy - 14, 'O', PULL) + atom(cx - 40, cy + 18, 'H') + atom(cx + 40, cy + 18, 'H') +
      pairs(cx, cy - 14, ['nw', 'ne']);
  }

  function nh3(cx, cy) {
    return bond(cx - 9, cy - 6, cx - 33, cy + 15) + bond(cx, cy - 3, cx, cy + 24) + bond(cx + 9, cy - 6, cx + 33, cy + 15) +
      atom(cx, cy - 16, 'N', PULL) + pair(cx, cy - 16, 'n') +
      atom(cx - 42, cy + 22, 'H') + atom(cx, cy + 36, 'H') + atom(cx + 42, cy + 22, 'H');
  }

  function hcl(cx, cy) {
    return bond(cx - 22, cy, cx + 12, cy) + atom(cx - 32, cy, 'H') + chlorine(cx + 28, cy, ['n', 's', 'e']);
  }

  function h2(cx, cy) {
    return bond(cx - 10, cy, cx + 10, cy) + atom(cx - 20, cy, 'H') + atom(cx + 20, cy, 'H');
  }

  function o2(cx, cy) {
    return doubleBond(cx - 12, cx + 12, cy) + atom(cx - 24, cy, 'O', PULL) + atom(cx + 24, cy, 'O', PULL) +
      pairs(cx - 24, cy, ['n', 's']) + pairs(cx + 24, cy, ['n', 's']);
  }

  function n2(cx, cy) {
    return tripleBond(cx - 14, cx + 14, cy) + atom(cx - 26, cy, 'N', PULL) + atom(cx + 26, cy, 'N', PULL) +
      pair(cx - 26, cy, 'w') + pair(cx + 26, cy, 'e');
  }

  function f2(cx, cy) {
    return bond(cx - 12, cy, cx + 12, cy) + atom(cx - 24, cy, 'F', PULL) + atom(cx + 24, cy, 'F', PULL) +
      pairs(cx - 24, cy, ['n', 's', 'w']) + pairs(cx + 24, cy, ['n', 's', 'e']);
  }

  // Carbon with four outer atoms in a cross. outer = { n, s, e, w }, each 'H' or 'Cl'.
  function carbonCross(cx, cy, outer) {
    const far = { n: [0, -50], s: [0, 50], e: [58, 0], w: [-58, 0] };
    const away = { n: ['n', 'w', 'e'], s: ['s', 'w', 'e'], e: ['e', 'n', 's'], w: ['w', 'n', 's'] };
    let body = '';
    Object.keys(far).forEach(side => {
      const [dx, dy] = far[side];
      const isCl = outer[side] === 'Cl';
      const gap = isCl ? 16 : 10;
      const ux = Math.sign(dx);
      const uy = Math.sign(dy);
      body += bond(cx + ux * 11, cy + uy * 13, cx + dx - ux * gap, cy + dy - uy * (gap + 2));
      body += isCl ? chlorine(cx + dx, cy + dy, away[side]) : atom(cx + dx, cy + dy, 'H');
    });
    return body + atom(cx, cy, 'C');
  }

  // ---- Particle models: H₂ and O₂ as joined spheres ----
  function h2Particle(x, y) {
    return [x - 9, x + 9].map(ax => `<circle cx="${ax}" cy="${y}" r="11" fill="var(--pe-surface)" stroke="${INK}" stroke-width="1.6"/><text x="${ax}" y="${y}" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="${INK}" text-anchor="middle" dominant-baseline="central">H</text>`).join('');
  }

  function o2Particle(x, y) {
    return [x - 12, x + 12].map(ax => `<circle cx="${ax}" cy="${y}" r="15" fill="${PULL}" stroke="${INK}" stroke-width="1.6"/><text x="${ax}" y="${y}" font-family="var(--font-mono)" font-size="13" font-weight="700" fill="var(--pe-primary-ink)" text-anchor="middle" dominant-baseline="central">O</text>`).join('');
  }

  // ---- Energy profile: reactant plateau, one hump, product plateau ----
  // levels in kJ/mol; top is the value at the top of the axis.
  function energyProfile(reactants, peak, products, top, aria) {
    const x0 = 70, x1 = 540, yBase = 200, yTop = 30;
    const y = v => yBase - (v / top) * (yBase - yTop);
    const yr = y(reactants), yp = y(peak), yq = y(products);
    const guide = (v, x2) => `<line x1="${x0}" y1="${y(v)}" x2="${x2}" y2="${y(v)}" stroke="${MUTE}" stroke-width="1" stroke-dasharray="3 3"/>` +
      `<text x="${x0 - 8}" y="${y(v)}" font-family="var(--font-mono)" font-size="13" fill="${MUTE}" text-anchor="end" dominant-baseline="central">${v}</text>`;
    const body =
      `<line x1="${x0}" y1="${yTop - 10}" x2="${x0}" y2="${yBase}" stroke="${INK}" stroke-width="1.6"/>` +
      `<line x1="${x0}" y1="${yBase}" x2="${x1}" y2="${yBase}" stroke="${INK}" stroke-width="1.6"/>` +
      guide(reactants, 110) + guide(peak, 300) + guide(products, 430) +
      `<path d="M110 ${yr} L190 ${yr} C250 ${yr}, 260 ${yp}, 300 ${yp} C340 ${yp}, 350 ${yq}, 430 ${yq} L510 ${yq}" fill="none" stroke="${PULL}" stroke-width="3" stroke-linecap="round"/>` +
      label(150, yr - 10, 'reactants') + label(300, yp - 10, 'peak') + label(470, yq - 10, 'products') +
      label(305, 228, 'reaction progress') +
      `<text x="20" y="${(yTop + yBase) / 2}" font-family="var(--font-display)" font-size="14" fill="${MUTE}" text-anchor="middle" transform="rotate(-90 20 ${(yTop + yBase) / 2})">energy (kJ/mol)</text>`;
    return svg(560, 240, aria, body);
  }

  // ---- Fatty-acid chain as a zigzag line drawing, carboxyl end on the left ----
  // opts: { bonds, kinkAt (bond index where the chain turns), kink (degrees), doubleAt (bond index) }
  function fattyChain(x, y, opts) {
    const L = 15;
    let dir = 0;
    let px = x, py = y;
    const pts = [[px, py]];
    let dbl = '';
    for (let i = 0; i < opts.bonds; i++) {
      if (opts.kinkAt === i) dir += opts.kink;
      const a = (dir + (i % 2 ? 30 : -30)) * Math.PI / 180;
      const nx = px + L * Math.cos(a), ny = py + L * Math.sin(a);
      if (opts.doubleAt === i) {
        const ox = -Math.sin(a) * 4.5, oy = Math.cos(a) * 4.5;
        const sx = px + (nx - px) * 0.2, sy = py + (ny - py) * 0.2, ex = px + (nx - px) * 0.8, ey = py + (ny - py) * 0.8;
        dbl = `<line x1="${(sx + ox).toFixed(1)}" y1="${(sy + oy).toFixed(1)}" x2="${(ex + ox).toFixed(1)}" y2="${(ey + oy).toFixed(1)}" stroke="${PULL}" stroke-width="2.2" stroke-linecap="round"/>`;
      }
      px = nx; py = ny;
      pts.push([px, py]);
    }
    const line = `<polyline points="${pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
    const head = `<text x="${x - 8}" y="${y}" font-family="var(--font-mono)" font-weight="700" font-size="13" fill="${MUTE}" text-anchor="end" dominant-baseline="central">COOH</text>`;
    return head + line + dbl;
  }

  window.PE_FIGURES = {
    INK, MUTE, PULL,
    svg, label, sign, arrow, divider, hDivider,
    atom, bond, doubleBond, tripleBond, pair, pairs, chlorine,
    co2, h2o, nh3, hcl, h2, o2, n2, f2, carbonCross,
    h2Particle, o2Particle, energyProfile, fattyChain
  };
})();
