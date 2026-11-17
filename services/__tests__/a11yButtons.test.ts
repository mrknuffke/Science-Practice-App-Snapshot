/**
 * Every <button> in the React app needs an accessible name: visible text, aria-label,
 * aria-labelledby or title. An icon-only button without one is read as just "button".
 * Found 48 on 2026-11-02; this keeps the count at zero.
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..', '..');
const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return d.name === '__tests__' ? [] : walk(p);
    return d.name.endsWith('.tsx') ? [p] : [];
  });

// Props through which a child component renders readable text.
const TEXT_PROPS = new Set(['content', 'html', 'text', 'label']);

const childHasText = (c: ts.Node): boolean => {
  if (ts.isJsxText(c)) return c.text.trim().length > 0;
  if (ts.isJsxExpression(c)) {
    const e = c.expression;
    if (!e) return false;
    if (ts.isJsxElement(e) || ts.isJsxSelfClosingElement(e)) return childHasText(e);
    return true;
  }
  if (ts.isJsxSelfClosingElement(c)) {
    const tag = c.tagName.getText();
    const props = c.attributes.properties.map(p => (p.name ? p.name.getText() : ''));
    if (tag === 'img') return props.includes('alt');
    if (/^[A-Z]/.test(tag)) return props.some(p => TEXT_PROPS.has(p));
    return false;
  }
  if (ts.isJsxElement(c)) {
    if (c.openingElement.tagName.getText() === 'svg') return false;
    if (c.openingElement.getText().includes('sr-only')) return true;
    return c.children.some(childHasText);
  }
  if (ts.isJsxFragment(c)) return c.children.some(childHasText);
  return false;
};

const insideLabel = (n: ts.Node): boolean => {
  for (let p = n.parent; p; p = p.parent) {
    if (ts.isJsxElement(p) && p.openingElement.tagName.getText() === 'label') return true;
  }
  return false;
};

describe('accessibility: buttons have accessible names', () => {
  it('no icon-only <button> without aria-label, aria-labelledby or title', () => {
    const files = [path.join(ROOT, 'App.tsx'), ...walk(path.join(ROOT, 'components'))];
    const unnamed: string[] = [];
    for (const f of files) {
      const src = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (n: ts.Node) => {
        if (ts.isJsxElement(n) && n.openingElement.tagName.getText() === 'button') {
          const attrs = n.openingElement.attributes.properties.map(p => (p.name ? p.name.getText() : '...'));
          const named = attrs.some(a => ['aria-label', 'aria-labelledby', 'title', '...'].includes(a));
          if (!named && !insideLabel(n) && !n.children.some(childHasText)) {
            unnamed.push(`${path.relative(ROOT, f)}:${src.getLineAndCharacterOfPosition(n.getStart()).line + 1}`);
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(src);
    }
    expect(unnamed).toEqual([]);
  });
});
