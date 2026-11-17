/**
 * qrcode.js - Spec-compliant, zero-dependency QR Code SVG generator
 * Generates vector QR Code SVG markup for receipt-check URLs.
 * Supports QR Versions 1 to 10 in Byte Mode with Reed-Solomon Error Correction.
 *
 * Strict Zero Em-Dashes Invariant observed.
 */

(function (global) {
  'use strict';

  // Galois Field GF(256) tables (primitive polynomial 0x11D: x^8 + x^4 + x^3 + x^2 + 1)
  const EXP_TABLE = new Array(256);
  const LOG_TABLE = new Array(256);
  let gfVal = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = gfVal;
    LOG_TABLE[gfVal] = i;
    gfVal = gfVal << 1;
    if (gfVal & 256) gfVal ^= 0x11d;
  }
  EXP_TABLE[255] = EXP_TABLE[0];

  function gmult(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
  }

  // QR specifications for Versions 1 to 10 with ECC Level L and M
  const VERSION_CAPACITIES = [
    null,
    { total: 26, L: { data: 19, ecc: 7, blocks: 1 }, M: { data: 16, ecc: 10, blocks: 1 } },
    { total: 44, L: { data: 34, ecc: 10, blocks: 1 }, M: { data: 28, ecc: 16, blocks: 1 } },
    { total: 70, L: { data: 55, ecc: 15, blocks: 1 }, M: { data: 44, ecc: 26, blocks: 1 } },
    { total: 100, L: { data: 80, ecc: 20, blocks: 1 }, M: { data: 64, ecc: 18, blocks: 2 } },
    { total: 134, L: { data: 108, ecc: 26, blocks: 1 }, M: { data: 86, ecc: 24, blocks: 2 } },
    { total: 172, L: { data: 136, ecc: 18, blocks: 2 }, M: { data: 108, ecc: 16, blocks: 4 } },
    { total: 196, L: { data: 156, ecc: 20, blocks: 2 }, M: { data: 124, ecc: 18, blocks: 4 } },
    { total: 242, L: { data: 194, ecc: 24, blocks: 2 }, M: { data: 154, ecc: 22, blocks: 4 } },
    { total: 292, L: { data: 232, ecc: 30, blocks: 2 }, M: { data: 182, ecc: 22, blocks: 5 } },
    { total: 346, L: { data: 274, ecc: 18, blocks: 4 }, M: { data: 216, ecc: 26, blocks: 5 } }
  ];

  const ALIGNMENT_LOCATIONS = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50]
  ];

  function getGeneratorPoly(deg) {
    let poly = [1];
    for (let i = 0; i < deg; i++) {
      const nextPoly = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        nextPoly[j] ^= gmult(poly[j], EXP_TABLE[i]);
        nextPoly[j + 1] ^= poly[j];
      }
      poly = nextPoly;
    }
    return poly;
  }

  function computeECC(data, eccLen) {
    const gen = getGeneratorPoly(eccLen);
    const msg = data.concat(new Array(eccLen).fill(0));
    for (let i = 0; i < data.length; i++) {
      const coef = msg[i];
      if (coef !== 0) {
        for (let j = 0; j < gen.length; j++) {
          msg[i + j] ^= gmult(gen[j], coef);
        }
      }
    }
    return msg.slice(data.length);
  }

  function createQRCodeMatrix(text, errorCorrectionLevel = 'M') {
    // Convert string to UTF-8 bytes
    const utf8Bytes = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (code < 128) {
        utf8Bytes.push(code);
      } else if (code < 2048) {
        utf8Bytes.push(192 | (code >> 6));
        utf8Bytes.push(128 | (code & 63));
      } else {
        utf8Bytes.push(224 | (code >> 12));
        utf8Bytes.push(128 | ((code >> 6) & 63));
        utf8Bytes.push(128 | (code & 63));
      }
    }

    // Determine minimal version
    let version = 1;
    let ecSpec = null;
    for (let v = 1; v <= 10; v++) {
      const spec = VERSION_CAPACITIES[v][errorCorrectionLevel];
      const lengthBits = v < 10 ? 8 : 16;
      const requiredBits = 4 + lengthBits + utf8Bytes.length * 8;
      const maxBits = spec.data * 8;
      if (requiredBits <= maxBits) {
        version = v;
        ecSpec = spec;
        break;
      }
    }

    if (!ecSpec) {
      if (errorCorrectionLevel !== 'L') {
        return createQRCodeMatrix(text, 'L');
      }
      throw new Error('Data payload exceeds QR Version 10 capacity');
    }

    // Assemble Bit Stream
    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    }

    pushBits(4, 4); // Byte Mode Indicator (0100)
    pushBits(utf8Bytes.length, version < 10 ? 8 : 16); // Character Count
    for (let b of utf8Bytes) {
      pushBits(b, 8);
    }
    const totalDataBits = ecSpec.data * 8;
    const termLen = Math.min(4, totalDataBits - bits.length);
    pushBits(0, termLen);
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }
    const padBytes = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length < totalDataBits) {
      pushBits(padBytes[padIdx % 2], 8);
      padIdx++;
    }

    // Convert bits to data codewords
    const dataCodewords = [];
    for (let i = 0; i < bits.length; i += 8) {
      let byteVal = 0;
      for (let j = 0; j < 8; j++) {
        byteVal = (byteVal << 1) | bits[i + j];
      }
      dataCodewords.push(byteVal);
    }

    // Block partitioning & Reed-Solomon computation
    const numBlocks = ecSpec.blocks;
    const eccLength = ecSpec.ecc;
    const totalDataBytes = ecSpec.data;
    const baseBlockDataLen = Math.floor(totalDataBytes / numBlocks);
    const extraBlocks = totalDataBytes % numBlocks;

    const dataBlocks = [];
    const eccBlocks = [];
    let offset = 0;
    for (let b = 0; b < numBlocks; b++) {
      const blockDataLen = baseBlockDataLen + (b >= numBlocks - extraBlocks ? 1 : 0);
      const blockData = dataCodewords.slice(offset, offset + blockDataLen);
      offset += blockDataLen;
      dataBlocks.push(blockData);
      eccBlocks.push(computeECC(blockData, eccLength));
    }

    // Interleave Codewords
    const finalCodewords = [];
    const maxDataBlockLen = baseBlockDataLen + (extraBlocks > 0 ? 1 : 0);
    for (let i = 0; i < maxDataBlockLen; i++) {
      for (let b = 0; b < numBlocks; b++) {
        if (i < dataBlocks[b].length) {
          finalCodewords.push(dataBlocks[b][i]);
        }
      }
    }
    for (let i = 0; i < eccLength; i++) {
      for (let b = 0; b < numBlocks; b++) {
        finalCodewords.push(eccBlocks[b][i]);
      }
    }

    // Matrix construction
    const size = 17 + version * 4;
    const matrix = Array.from({ length: size }, () => Array(size).fill(null));
    const isFunction = Array.from({ length: size }, () => Array(size).fill(false));

    function addFinder(startX, startY) {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const isDark = (y === 0 || y === 6 || x === 0 || x === 6 || (y >= 2 && y <= 4 && x >= 2 && x <= 4));
          matrix[startY + y][startX + x] = isDark ? 1 : 0;
          isFunction[startY + y][startX + x] = true;
        }
      }
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          if (x === -1 || x === 7 || y === -1 || y === 7) {
            const px = startX + x;
            const py = startY + y;
            if (px >= 0 && px < size && py >= 0 && py < size) {
              matrix[py][px] = 0;
              isFunction[py][px] = true;
            }
          }
        }
      }
    }

    addFinder(0, 0);
    addFinder(size - 7, 0);
    addFinder(0, size - 7);

    // Alignment Patterns
    const alignCoords = ALIGNMENT_LOCATIONS[version];
    for (let i = 0; i < alignCoords.length; i++) {
      for (let j = 0; j < alignCoords.length; j++) {
        const cx = alignCoords[i];
        const cy = alignCoords[j];
        if (
          (cx < 9 && cy < 9) ||
          (cx > size - 9 && cy < 9) ||
          (cx < 9 && cy > size - 9)
        ) {
          continue;
        }
        for (let y = -2; y <= 2; y++) {
          for (let x = -2; x <= 2; x++) {
            const isDark = (Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0));
            matrix[cy + y][cx + x] = isDark ? 1 : 0;
            isFunction[cy + y][cx + x] = true;
          }
        }
      }
    }

    // Timing Patterns
    for (let i = 8; i < size - 8; i++) {
      if (!isFunction[6][i]) {
        matrix[6][i] = (i % 2 === 0) ? 1 : 0;
        isFunction[6][i] = true;
      }
      if (!isFunction[i][6]) {
        matrix[i][6] = (i % 2 === 0) ? 1 : 0;
        isFunction[i][6] = true;
      }
    }

    // Dark Module
    matrix[4 * version + 9][8] = 1;
    isFunction[4 * version + 9][8] = true;

    // Reserve Format Information Areas
    for (let i = 0; i < 9; i++) {
      if (!isFunction[8][i]) isFunction[8][i] = true;
      if (!isFunction[i][8]) isFunction[i][8] = true;
    }
    for (let i = size - 8; i < size; i++) {
      if (!isFunction[8][i]) isFunction[8][i] = true;
      if (!isFunction[i][8]) isFunction[i][8] = true;
    }

    // Version Information for Version >= 7
    if (version >= 7) {
      const versionInfoBits = [
        0x07c94, 0x085bc, 0x09a99, 0x0a4d3
      ][version - 7];
      for (let i = 0; i < 18; i++) {
        const bit = (versionInfoBits >> i) & 1;
        const x1 = Math.floor(i / 3);
        const y1 = size - 11 + (i % 3);
        matrix[y1][x1] = bit;
        isFunction[y1][x1] = true;
        matrix[x1][y1] = bit;
        isFunction[x1][y1] = true;
      }
    }

    // Place Data Bits
    const dataBits = [];
    for (let byte of finalCodewords) {
      for (let i = 7; i >= 0; i--) {
        dataBits.push((byte >> i) & 1);
      }
    }
    const remainderBitsCount = [0, 0, 7, 7, 7, 7, 7, 0, 0, 0, 0][version];
    for (let i = 0; i < remainderBitsCount; i++) {
      dataBits.push(0);
    }

    let bitIndex = 0;
    let upwards = true;
    for (let right = size - 1; right > 0; right -= 2) {
      if (right === 6) right--;
      const colList = [right, right - 1];
      const rowList = upwards
        ? Array.from({ length: size }, (_, i) => size - 1 - i)
        : Array.from({ length: size }, (_, i) => i);

      for (let r of rowList) {
        for (let c of colList) {
          if (!isFunction[r][c]) {
            matrix[r][c] = (bitIndex < dataBits.length) ? dataBits[bitIndex++] : 0;
          }
        }
      }
      upwards = !upwards;
    }

    // Mask evaluation
    function getMask(pattern, r, c) {
      switch (pattern) {
        case 0: return (r + c) % 2 === 0;
        case 1: return r % 2 === 0;
        case 2: return c % 3 === 0;
        case 3: return (r + c) % 3 === 0;
        case 4: return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
        case 5: return ((r * c) % 2) + ((r * c) % 3) === 0;
        case 6: return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
        case 7: return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
      }
      return false;
    }

    function evaluatePenalty(grid) {
      let penalty = 0;
      for (let r = 0; r < size; r++) {
        let runColor = -1, runLen = 0;
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === runColor) {
            runLen++;
          } else {
            if (runLen >= 5) penalty += 3 + (runLen - 5);
            runColor = grid[r][c];
            runLen = 1;
          }
        }
        if (runLen >= 5) penalty += 3 + (runLen - 5);
      }
      for (let c = 0; c < size; c++) {
        let runColor = -1, runLen = 0;
        for (let r = 0; r < size; r++) {
          if (grid[r][c] === runColor) {
            runLen++;
          } else {
            if (runLen >= 5) penalty += 3 + (runLen - 5);
            runColor = grid[r][c];
            runLen = 1;
          }
        }
        if (runLen >= 5) penalty += 3 + (runLen - 5);
      }
      for (let r = 0; r < size - 1; r++) {
        for (let c = 0; c < size - 1; c++) {
          const val = grid[r][c];
          if (val === grid[r + 1][c] && val === grid[r][c + 1] && val === grid[r + 1][c + 1]) {
            penalty += 3;
          }
        }
      }
      return penalty;
    }

    let bestMask = 0;
    let lowestPenalty = Infinity;
    let bestGrid = null;

    for (let maskPattern = 0; maskPattern < 8; maskPattern++) {
      const candidateGrid = Array.from({ length: size }, () => Array(size).fill(0));
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (isFunction[r][c]) {
            candidateGrid[r][c] = matrix[r][c];
          } else {
            candidateGrid[r][c] = matrix[r][c] ^ (getMask(maskPattern, r, c) ? 1 : 0);
          }
        }
      }
      const penalty = evaluatePenalty(candidateGrid);
      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestMask = maskPattern;
        bestGrid = candidateGrid;
      }
    }

    // Format Information Placement
    const ecBits = errorCorrectionLevel === 'L' ? 1 : 0;
    const formatData = (ecBits << 3) | bestMask;
    let formatPoly = formatData << 10;
    const genPoly = 0x537;
    for (let i = 14; i >= 10; i--) {
      if ((formatPoly >> i) & 1) {
        formatPoly ^= (genPoly << (i - 10));
      }
    }
    const formatInfo = ((formatData << 10) | formatPoly) ^ 0x5412;

    for (let i = 0; i < 15; i++) {
      const bit = (formatInfo >> i) & 1;
      let r1, c1;
      if (i < 6) { r1 = 8; c1 = i; }
      else if (i === 6) { r1 = 8; c1 = 7; }
      else if (i === 7) { r1 = 8; c1 = 8; }
      else if (i === 8) { r1 = 7; c1 = 8; }
      else { r1 = 14 - i; c1 = 8; }
      bestGrid[r1][c1] = bit;

      let r2, c2;
      if (i < 8) {
        r2 = size - 1 - i;
        c2 = 8;
      } else {
        r2 = 8;
        c2 = size - 15 + i;
      }
      bestGrid[r2][c2] = bit;
    }

    return bestGrid;
  }

  function generateQRCodeSVG(text, size = 96) {
    try {
      const grid = createQRCodeMatrix(text, 'M');
      const moduleCount = grid.length;
      const margin = 2;
      const totalModules = moduleCount + margin * 2;
      const cellSize = (size / totalModules);

      let path = '';
      for (let r = 0; r < moduleCount; r++) {
        for (let c = 0; c < moduleCount; c++) {
          if (grid[r][c] === 1) {
            const x = ((c + margin) * cellSize).toFixed(2);
            const y = ((r + margin) * cellSize).toFixed(2);
            const s = cellSize.toFixed(2);
            path += `M${x},${y}h${s}v${s}h-${s}z `;
          }
        }
      }

      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${path.trim()}" fill="#000000"/></svg>`;
    } catch {
      return `<div style="width:${size}px;height:${size}px;border:1px solid #000;display:flex;align-items:center;justify-content:center;font-size:7pt;text-align:center;">SCAN<br>SEAL</div>`;
    }
  }

  global.generateQRCodeSVG = generateQRCodeSVG;
})(typeof window !== 'undefined' ? window : this);
