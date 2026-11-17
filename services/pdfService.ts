/**
 * PDF Ingestion Service
 * 
 * Extracts text content from PDFs and user-provided text for content generation.
 * Uses Gemini API's vision capabilities to read PDFs.
 */

import { callAI, DEFAULT_MODEL } from './ai/core';

const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validates a file for PDF ingestion
 */
export const validatePDFFile = (file: File): { valid: boolean; error?: string } => {
    if (!file.type.includes('pdf')) {
        return { valid: false, error: 'Please upload a PDF file' };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: `File size must be under ${MAX_FILE_SIZE_MB}MB` };
    }
    return { valid: true };
};

/**
 * Converts a file to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

/**
 * Extracts text content from a PDF using Gemini's vision capabilities
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
    const validation = validatePDFFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const base64Data = await fileToBase64(file);

    const prompt = `
        You are a document text extractor. Analyze this PDF document and extract ALL text content.
        
        TASK:
        1. Read the entire PDF document
        2. Extract all readable text, preserving structure where possible
        3. Include headers, paragraphs, bullet points, and table data
        4. Format the output as clean, readable text
        
        RULES:
        - Do NOT summarize - extract the actual text
        - Preserve important formatting (lists, sections)
        - If the PDF appears to be scanned/image-based with poor quality, do your best to OCR it
        - If no text can be extracted, return "EXTRACTION_FAILED: [reason]"
        
        OUTPUT:
        Return the extracted text directly, no JSON wrapper needed.
    `;

    const contents = {
        parts: [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: 'application/pdf',
                },
            },
            {
                text: prompt
            }
        ]
    };

    try {
        const response = await callAI(DEFAULT_MODEL, contents, {});
        const text = response.text || '';

        if (text.startsWith('EXTRACTION_FAILED')) {
            throw new Error('Could not extract text from this PDF. It may be scanned or image-based.');
        }

        return text.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error(`PDF extraction failed: ${error instanceof Error && error.message ? error.message : 'Unknown error'}`);
    }
};

/**
 * Parses raw text input from user (notes, markdown, etc.)
 * Cleans and normalizes the text for AI processing
 */
export const parseTextInput = (text: string, isMarkdown: boolean = false): string => {
    let cleaned = text.trim();

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]+/g, ' ');

    if (isMarkdown) {
        // Keep markdown structure but clean up
        // Remove HTML comments
        cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Truncate if too long (max ~8000 chars for context)
    if (cleaned.length > 8000) {
        cleaned = cleaned.substring(0, 8000) + '\n\n[Content truncated...]';
    }

    return cleaned;
};

/**
 * Combines PDF and text inputs into a single context string
 */
export const combineSourceContent = async (
    pdfFile?: File | null,
    textInput?: string
): Promise<string> => {
    const parts: string[] = [];

    if (pdfFile) {
        try {
            const pdfText = await extractTextFromPDF(pdfFile);
            parts.push('--- PDF CONTENT ---\n' + pdfText);
        } catch (error) {
            console.error('PDF extraction failed:', error);
            // Continue with text input if PDF fails
        }
    }

    if (textInput?.trim()) {
        const cleanedText = parseTextInput(textInput);
        parts.push('--- TEXT INPUT ---\n' + cleanedText);
    }

    return parts.join('\n\n');
};

export default {
    validatePDFFile,
    fileToBase64,
    extractTextFromPDF,
    parseTextInput,
    combineSourceContent
};
