import { describe, it, expect } from 'vitest';
import { normalizeScientificNotation, cleanHtml, formatScientificText } from '../sanitize';

describe('sanitize and scientific notation utilities', () => {
  describe('normalizeScientificNotation', () => {
    it('decodes escaped HTML formatting tags', () => {
      expect(normalizeScientificNotation('Z&lt;sub&gt;eff&lt;/sub&gt;')).toBe('Z<sub>eff</sub>');
      expect(normalizeScientificNotation('Ca&lt;sup&gt;2+&lt;/sup&gt;')).toBe('Ca<sup>2+</sup>');
      expect(normalizeScientificNotation('&lt;b&gt;Important&lt;/b&gt;')).toBe('<b>Important</b>');
    });

    it('normalizes Z_{eff} and Z_eff notation to HTML subscript', () => {
      expect(normalizeScientificNotation('Z_{eff}')).toBe('Z<sub>eff</sub>');
      expect(normalizeScientificNotation('Z_eff')).toBe('Z<sub>eff</sub>');
      expect(normalizeScientificNotation('The value of Z_{eff} increases across a period.')).toBe(
        'The value of Z<sub>eff</sub> increases across a period.'
      );
    });

    it('handles null, undefined, or empty string safely', () => {
      expect(normalizeScientificNotation(null)).toBe('');
      expect(normalizeScientificNotation(undefined)).toBe('');
      expect(normalizeScientificNotation('')).toBe('');
    });
  });

  describe('cleanHtml', () => {
    it('pre-decodes safe escaped tags and allows safe tags', () => {
      const sanitized = cleanHtml('Z&lt;sub&gt;eff&lt;/sub&gt;');
      expect(sanitized).toBe('Z<sub>eff</sub>');
    });

    it('strips malicious script tags while retaining safe formatting', () => {
      const dirty = '<b>Safe</b><script>alert("xss")</script><i>Content</i>';
      const clean = cleanHtml(dirty);
      expect(clean).toContain('<b>Safe</b>');
      expect(clean).toContain('<i>Content</i>');
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('alert');
    });
  });

  describe('formatScientificText', () => {
    it('converts subscript and superscript digits to unicode', () => {
      expect(formatScientificText('H<sub>2</sub>O')).toBe('H₂O');
      expect(formatScientificText('Ca<sup>2</sup>')).toBe('Ca²');
    });
  });
});
