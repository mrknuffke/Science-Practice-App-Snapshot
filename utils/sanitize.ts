import DOMPurify from 'dompurify';

/**
 * Normalizes common scientific notation patterns (e.g. Z_{eff}, Z_eff, escaped sub/sup tags)
 * so they render properly in DOM components and Markdown.
 */
export const normalizeScientificNotation = (text: string | null | undefined): string => {
    if (!text) return "";
    return text
        // Decode escaped safe HTML tags: &lt;sub&gt; -> <sub>, &lt;sup&gt; -> <sup>, etc.
        .replace(/&lt;(\/?(?:sub|sup|b|i|em|strong|br|span))&gt;/gi, '<$1>')
        // Convert plain text Z_{eff} or Z_eff to Z<sub>eff</sub>
        .replace(/\bZ_(?:\{([a-zA-Z0-9]+)\}|([a-zA-Z0-9]+)\b)/g, (_, m1, m2) => `Z<sub>${m1 || m2}</sub>`);
};

/**
 * Sanitizes an HTML string to prevent XSS attacks while preserving
 * styling and scientific notation used by the AI.
 */
export const cleanHtml = (dirty: string | null | undefined): string => {
    if (!dirty) return "";
    // Pre-decode escaped safe formatting tags so DOMPurify can process them as valid elements
    const preCleaned = dirty.replace(/&lt;(\/?(?:sub|sup|b|i|em|strong|br|span))&gt;/gi, '<$1>');
    return DOMPurify.sanitize(preCleaned, {
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'u', 's', 'strike',
            'sub', 'sup',
            'br', 'p', 'div', 'span',
            'ul', 'ol', 'li',
            'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
            'svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'text'
        ],
        ALLOWED_ATTR: [
            'class', 'id', 'style',
            'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
            'x', 'y', 'width', 'height', 'cx', 'cy', 'r',
            'type' // for ol type='a' etc
        ],
        ADD_TAGS: ['svg', 'path', 'g', 'rect', 'circle', 'line', 'text'], // Explicitly ensure SVG support
        ADD_ATTR: ['viewBox', 'd', 'fill', 'stroke', 'stroke-width'], // Explicitly ensure SVG attrs
    });
};

/**
 * Converts HTML subscripts/superscripts to Unicode characters for SVG text support.
 * e.g. "CO<sub>2</sub>" -> "CO₂"
 */
export const formatScientificText = (text: string): string => {
    if (!text) return "";
    return text
        .replace(/<sub>(\d+)<\/sub>/g, (_, num) => {
            const subs: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
            return num.split('').map((n: string) => subs[n] || n).join('');
        })
        .replace(/<sup>(\d+)<\/sup>/g, (_, num) => {
            const sups: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
            return num.split('').map((n: string) => sups[n] || n).join('');
        })
        .replace(/<[^>]+>/g, ''); // Strip remaining tags
};

/**
 * Strips HTML tags and decodes basic entities for PDF export.
 * Replaces <br> and <p> with newlines.
 */
export const sanitizeForPdf = (html: string): string => {
    if (!html) return "";
    // Replace <br> and <p> with newlines
    let text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n");
    // Strip all other tags
    text = text.replace(/<[^>]+>/g, "");
    // Decode entities
    text = text.replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    return text.trim();
};

/**
 * Applies smart formatting to valid HTML/Text for better scientific readability.
 * Inserts line breaks for lists of constants, key instructions, and equations.
 */
export const smartFormatScienceText = (text: string): string => {
    if (!text) return "";

    let formatted = text;

    // 1. Break lists of constants (e.g. "H-H = 436, Cl-Cl = 242", "ΔHf(...) = ...")
    // Matches Comma + Space + (Chemical/Variable Pattern = )
    formatted = formatted.replace(/,\s+([A-Z][a-z]?-[A-Z][a-z]?\s*=|Δ[HGS]|K[a-z]*\s*=|E°\s*=|\[[A-Z0-9]+\]\s*=)/g, ',<br/><span class="inline-block mt-1 pl-4">$1</span>');

    // 2. Break before key instruction verbs (Calculate, Determine, Given, Estimate)
    //    if they follow punctuation, newline, or start of string.
    formatted = formatted.replace(/([.?!]|\n|^)\s*(Calculate|Determine|Given|Estimate|Using)\b/g, '$1<br/><br/><strong>$2</strong>');

    // 3. Ensure "Reaction:" or "Equation:" introduces a break
    formatted = formatted.replace(/(\s*(?:following|the)\s*(?:reaction|equation)\s*:?)\s+/gi, '$1<br/>');

    // 4. Clean the resulting HTML
    return cleanHtml(formatted);
};
