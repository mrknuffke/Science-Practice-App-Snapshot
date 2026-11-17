#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const LESSONS_DIR = path.resolve('public/chem/lessons');

// If specific files are passed as CLI arguments, check only those; otherwise check modern target lessons
const cliArgs = process.argv.slice(2);
const TARGET_FILES = cliArgs.length > 0 
  ? cliArgs.map(f => path.resolve(f))
  : [
      path.join(LESSONS_DIR, '1-1a_atomic-structure-electron-config.html'),
      path.join(LESSONS_DIR, '1-1a.js'),
      path.join(LESSONS_DIR, '1-1b_periodic-trends-reactivity.html'),
      path.join(LESSONS_DIR, '1-1b.js'),
      path.join(LESSONS_DIR, '1-2a_bonding-electronegativity.html'),
      path.join(LESSONS_DIR, '1-2a.js'),
      path.join(LESSONS_DIR, '1-2c_chemical-nomenclature.html'),
      path.join(LESSONS_DIR, '1-2c.js'),
      path.join(LESSONS_DIR, '1-2e_reaction-types-balancing.html'),
      path.join(LESSONS_DIR, '1-2e.js'),
      path.join(LESSONS_DIR, '1-3a_lewis-structures.html'),
      path.join(LESSONS_DIR, '1-3a.js'),
      path.join(LESSONS_DIR, '1-3b_imfs-properties.html'),
      path.join(LESSONS_DIR, '1-3b.js'),
      path.join(LESSONS_DIR, '2-2a_physical-chemical-change.html'),
      path.join(LESSONS_DIR, '2-2a.js'),
      path.join(LESSONS_DIR, '2-6a_structure-property-argument.html'),
      path.join(LESSONS_DIR, '2-6a.js'),
      path.join(LESSONS_DIR, '2-7a_the-mole-molar-mass.html'),
      path.join(LESSONS_DIR, '2-7b_mole-conversions.html'),
      path.join(LESSONS_DIR, '2-7b.js')
    ];

let errorCount = 0;

function reportError(file, lineNum, message) {
  console.error(`\x1b[31m[DIAGRAM ERROR]\x1b[0m ${path.basename(file)}:${lineNum} - ${message}`);
  errorCount++;
}

// Regex rules
const RAW_HEX_FILL_REGEX = /fill="#(?!ffffff|fff)[0-9a-fA-F]{3,8}"/i;
const RAW_HEX_STROKE_REGEX = /stroke="#(?!ffffff|fff)[0-9a-fA-F]{3,8}"/i;
const EM_DASH_REGEX = /[—]|&mdash;/;
const AD_HOC_FONT_SIZE_REGEX = /<text\b[^>]*\bfont-size="\d+(\.\d+)?(px)?"[^>]*>/i;

// Walk lines of each file
for (const fullPath of TARGET_FILES) {
  if (!fs.existsSync(fullPath)) continue;
  const stat = fs.statSync(fullPath);
  if (!stat.isFile()) continue;

  if (fullPath.endsWith('.html')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    let inSvg = false;
    let inGoodSoftRect = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      if (line.includes('<svg')) inSvg = true;
      if (line.includes('</svg>')) inSvg = false;

      // Rule 1: Zero Em-Dashes
      if (EM_DASH_REGEX.test(line)) {
        reportError(fullPath, lineNum, 'Em-dash found. Use commas, colons, parentheses, or direct phrasing.');
      }

      if (inSvg) {
        // Rule 2: Raw hex in SVG
        if (RAW_HEX_FILL_REGEX.test(line)) {
          reportError(fullPath, lineNum, `Raw hex fill found: ${line.trim()}`);
        }
        if (RAW_HEX_STROKE_REGEX.test(line)) {
          reportError(fullPath, lineNum, `Raw hex stroke found: ${line.trim()}`);
        }

        // Rule 3: Bare numeric font-size in <text>
        if (AD_HOC_FONT_SIZE_REGEX.test(line)) {
          reportError(fullPath, lineNum, `Ad-hoc numeric font-size found in <text>. Use style="font-size:var(--dia-*)"`);
        }

        // Rule 4: Green on green check
        if (line.includes('fill="var(--good-soft)"')) {
          inGoodSoftRect = true;
        }
        if (inGoodSoftRect && line.includes('fill="var(--good)"') && line.includes('<text')) {
          reportError(fullPath, lineNum, 'Green text (var(--good)) placed over green fill (var(--good-soft)). Use var(--ink) for text.');
        }
        if (line.includes('</rect>') || line.includes('/>')) {
          inGoodSoftRect = false;
        }

        // Rule 5: Long prose in SVG text (> 50 chars)
        const textMatch = line.match(/<text\b[^>]*>(.*?)<\/text>/i);
        if (textMatch) {
          const inner = textMatch[1].replace(/&[a-z0-9]+;/gi, ' ');
          if (inner.trim().length > 50) {
            reportError(fullPath, lineNum, `Overly long prose string in SVG <text> (${inner.trim().length} chars): "${inner.trim().substring(0, 30)}...". Move to HTML .diagram-cap or .step-caption.`);
          }
        }
      }
    });
  } else if (fullPath.endsWith('.js')) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      if (EM_DASH_REGEX.test(line)) {
        reportError(fullPath, lineNum, 'Em-dash found in JS string/comment.');
      }
    });
  }
}

if (errorCount > 0) {
  console.error(`\n\x1b[31mFailed diagram verification with ${errorCount} error(s).\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\x1b[32m✔ Diagram verification passed across all lesson files.\x1b[0m`);
  process.exit(0);
}
