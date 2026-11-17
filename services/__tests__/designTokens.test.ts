import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design Tokens & Typography Invariants', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const tokensCssPath = path.join(rootDir, 'public/chem/assets/tokens.css');
  const componentsCssPath = path.join(rootDir, 'public/chem/assets/components.css');
  const appCssPath = path.join(rootDir, 'public/chem/diagram-generator/app.css');
  const aboutHtmlPath = path.join(rootDir, 'public/chem/about.html');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  it('the type scale is defined once, in the shared base.css, and chem keeps only its two micro sizes', () => {
    const base = fs.readFileSync(path.join(rootDir, 'public/textbook/base.css'), 'utf-8');
    for (const token of ['--text-xs', '--text-sm', '--text-base', '--text-md', '--text-lg', '--text-xl', '--text-2xl', '--text-3xl', '--text-4xl', '--text-read']) {
      expect(base, `base.css lost ${token}`).toContain(token);
    }
    // 11px and 9px are legal only in a diagram and the periodic table grid (standard 2.1)
    const components = fs.readFileSync(componentsCssPath, 'utf-8');
    expect(components).toContain('--text-2xs');
    expect(components).toContain('--text-3xs');
    // the retired 22px reading size is gone from chem's tokens
    expect(fs.readFileSync(tokensCssPath, 'utf-8')).not.toContain('--text-reading');
  });

  it('components.css has zero ad-hoc fractional rem or px font-size declarations', () => {
    const content = fs.readFileSync(componentsCssPath, 'utf-8');
    const regex = /font-size:\s*([^;]+);/g;
    const nonTokenDeclarations: string[] = [];

    let match;
    while ((match = regex.exec(content)) !== null) {
      const val = match[1].trim();
      if (!val.startsWith('var(--text-') && !val.includes('var(--text-') && val !== 'inherit') {
        nonTokenDeclarations.push(val);
      }
    }

    expect(nonTokenDeclarations).toEqual([]);
  });

  it('enforces strict zero em-dashes across core stylesheet and HTML assets', () => {
    const filesToCheck = [
      tokensCssPath,
      componentsCssPath,
      appCssPath,
      aboutHtmlPath,
      path.join(rootDir, 'public/chem/assets/reference-center.js'),
      path.join(rootDir, 'public/chem/assets/glossary.js'),
      path.join(rootDir, 'public/chem/assets/elements.js'),
      path.join(rootDir, 'public/physics/assets/tokens.css'),
      path.join(rootDir, 'public/physics/assets/components.css'),
      path.join(rootDir, 'public/physics/assets/book.js'),
      path.join(rootDir, 'public/physics/assets/glossary.js'),
      path.join(rootDir, 'public/physics/assets/reference-center.js'),
      path.join(rootDir, 'public/physics/lessons.json'),
      path.join(rootDir, 'public/physics/index.html'),
      path.join(rootDir, 'public/physics/about.html'),
      ...fs.readdirSync(path.join(rootDir, 'public/physics/lessons'))
        .filter(f => f.endsWith('.html') || f.endsWith('.js'))
        .map(f => path.join(rootDir, 'public/physics/lessons', f)),
      path.join(rootDir, 'public/bio/assets/tokens.css'),
      path.join(rootDir, 'public/bio/assets/components.css'),
      path.join(rootDir, 'public/bio/assets/book.js'),
      path.join(rootDir, 'public/bio/assets/glossary.js'),
      path.join(rootDir, 'public/bio/lessons.json'),
      path.join(rootDir, 'public/bio/index.html'),
      path.join(rootDir, 'public/bio/about.html'),
      ...fs.readdirSync(path.join(rootDir, 'public/bio/lessons'))
        .filter(f => f.endsWith('.html') || f.endsWith('.js'))
        .map(f => path.join(rootDir, 'public/bio/lessons', f)),
    ];

    for (const filePath of filesToCheck) {
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content.includes('\u2014')).toBe(false);
      expect(content.includes('&mdash;')).toBe(false);
    }
  });

  it('root index.html defines micro-typography tokens in tailwind config', () => {
    const content = fs.readFileSync(indexHtmlPath, 'utf-8');
    expect(content).toContain("'3xs'");
    expect(content).toContain("'2xs'");
  });

  it('all 27 lesson HTML files have zero ad-hoc font-size declarations in inline styles or style blocks', () => {
    const lessonsDir = path.join(rootDir, 'public/chem/lessons');
    const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.html') && !f.startsWith('_'));
    expect(files.length).toBe(27);

    const violations: { file: string; val: string }[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(lessonsDir, file), 'utf-8');

      // Check inline style font-size
      const inlineRegex = /style="[^"]*font-size:\s*([^;"]+)[^"]*"/gi;
      let m;
      while ((m = inlineRegex.exec(content)) !== null) {
        const val = m[1].trim();
        if (!val.startsWith('var(--text-') && !val.startsWith('var(--dia-') && val !== 'inherit') {
          violations.push({ file, val });
        }
      }

      // Check <style> blocks
      const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
      let bm;
      while ((bm = styleBlockRegex.exec(content)) !== null) {
        const css = bm[1];
        const cssRegex = /font-size:\s*([^;]+);/g;
        let cm;
        while ((cm = cssRegex.exec(css)) !== null) {
          const val = cm[1].trim();
          if (!val.startsWith('var(--text-') && !val.startsWith('var(--dia-') && val !== 'inherit') {
            violations.push({ file, val });
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('enforces strict zero em-dashes across all 27 lesson HTML files', () => {
    const lessonsDir = path.join(rootDir, 'public/chem/lessons');
    const files = fs.readdirSync(lessonsDir).filter(f => f.endsWith('.html') && !f.startsWith('_'));

    const filesWithEmDashes: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(lessonsDir, file), 'utf-8');
      if (content.includes('\u2014') || content.includes('&mdash;')) {
        filesWithEmDashes.push(file);
      }
    }

    expect(filesWithEmDashes).toEqual([]);
  });
});
