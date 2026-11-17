import { describe, it, expect } from 'vitest';
import { validatePDFFile, parseTextInput, combineSourceContent } from '../pdfService';

describe('pdfService', () => {
    describe('validatePDFFile', () => {
        it('should return valid for correct PDF file', () => {
            const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
            const result = validatePDFFile(file);
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should fail for non-PDF file type', () => {
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
            const result = validatePDFFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('PDF');
        });

        it('should fail for large files (>2MB)', () => {
            // Create a file larger than 2MB
            const content = new Array(2 * 1024 * 1024 + 100).fill('a').join('');
            const file = new File([content], 'large.pdf', { type: 'application/pdf' });
            const result = validatePDFFile(file);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('2MB');
        });
    });

    describe('parseTextInput', () => {
        it('should trim whitespace', () => {
            const input = '   hello world   ';
            expect(parseTextInput(input)).toBe('hello world');
        });

        it('should collapse 3+ newlines to 2', () => {
            const input = 'line1\n\n\nline2';
            expect(parseTextInput(input)).toBe('line1\n\nline2');
        });

        it('should truncate very long input', () => {
            const longText = new Array(10000).fill('a').join('');
            const result = parseTextInput(longText);
            expect(result.length).toBeLessThan(10000);
            expect(result).toContain('[Content truncated...]');
        });
    });

    describe('combineSourceContent', () => {
        it('should return empty string if no inputs', async () => {
            const result = await combineSourceContent(null, "");
            expect(result).toBe("");
        });

        it('should return just text input if no file', async () => {
            const result = await combineSourceContent(null, "some notes");
            expect(result).toContain("--- TEXT INPUT ---");
            expect(result).toContain("some notes");
        });
    });
});
