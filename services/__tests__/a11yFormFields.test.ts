/**
 * Every <input>, <textarea> and <select> in the React app needs an accessible name:
 * aria-label, aria-labelledby, title, a wrapping <label>, or an id that a <label htmlFor> names.
 * Placeholder text does not count (it disappears as the student types, and many screen readers
 * skip it). 203 fields had none on 2026-11-04; this keeps the count at zero.
 * Hidden inputs, and ones hidden with Tailwind's `hidden` class (file pickers opened by a
 * labelled button), are skipped.
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

const strip = (s: string) => s.replace(/^["'{]|["'}]$/g, '');

describe('accessibility: form fields have accessible names', () => {
  it('no input, textarea or select without a label', () => {
    const files = [path.join(ROOT, 'App.tsx'), ...walk(path.join(ROOT, 'components'))];
    const unnamed: string[] = [];
    for (const f of files) {
      const src = ts.createSourceFile(f, fs.readFileSync(f, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const htmlFor = new Set<string>();
      const collect = (n: ts.Node) => {
        if ((ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) && n.tagName.getText() === 'label') {
          for (const p of n.attributes.properties) {
            if (ts.isJsxAttribute(p) && p.name.getText() === 'htmlFor' && p.initializer) htmlFor.add(strip(p.initializer.getText()));
          }
        }
        ts.forEachChild(n, collect);
      };
      collect(src);
      const visit = (n: ts.Node) => {
        const el = ts.isJsxSelfClosingElement(n) ? n : ts.isJsxElement(n) ? n.openingElement : null;
        if (el && ['input', 'textarea', 'select'].includes(el.tagName.getText())) {
          const attrs: Record<string, string> = {};
          let spread = false;
          for (const p of el.attributes.properties) {
            if (!ts.isJsxAttribute(p)) { spread = true; continue; }
            attrs[p.name.getText()] = p.initializer ? p.initializer.getText() : 'true';
          }
          const type = strip(attrs.type ?? '');
          const cls = attrs.className ?? '';
          const hidden = type === 'hidden' || (/\bhidden\b/.test(cls) && !/sr-only/.test(cls));
          let inLabel = false;
          for (let p = n.parent; p; p = p.parent) {
            if (ts.isJsxElement(p) && p.openingElement.tagName.getText() === 'label') { inLabel = true; break; }
          }
          const id = strip(attrs.id ?? '');
          const named = spread || inLabel || 'aria-label' in attrs || 'aria-labelledby' in attrs || 'title' in attrs || (id !== '' && htmlFor.has(id));
          if (!named && !hidden) unnamed.push(`${path.relative(ROOT, f)}:${src.getLineAndCharacterOfPosition(el.getStart()).line + 1}`);
        }
        ts.forEachChild(n, visit);
      };
      visit(src);
    }
    expect(unnamed).toEqual([]);
  });
});
