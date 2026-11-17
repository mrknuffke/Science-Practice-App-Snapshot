/* global SpeechSynthesisVoice */

/**
 * Speech Synthesis Utilities for Science Practice Partner
 *
 * Provides:
 * 1. cleanTextForSpeech: Pedagogical normalization of HTML, LaTeX, Markdown, chemical formulas,
 *    and scientific symbols into natural spoken English for Web Speech API.
 * 2. Voice scoring and selection: Discovers and prioritizes premium natural/neural voices
 *    (e.g., Microsoft Natural, Google US/UK English, Apple Enhanced) and filters out legacy robotic synths.
 * 3. Robust speech playback: Chunks long passages by sentence to prevent browser utterance timeouts
 *    and keep pace at a warm, patient educator tempo.
 */

export interface SpeechSettings {
  voiceUri: string | null;
  rate: number; // default: 0.95 (natural educator cadence)
}

const STORAGE_KEY_VOICE = 'spp_tts_voice_uri';
const STORAGE_KEY_RATE = 'spp_tts_rate';

export const DEFAULT_RATE = 0.95;

/**
 * Normalizes text, HTML markup, scientific symbols, and chemical formulas
 * into clean, natural-sounding English for speech synthesis.
 */
export function cleanTextForSpeech(rawText: string | null | undefined): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Decode escaped HTML entities first if present
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // 2. Pre-process block HTML tags to ensure natural sentence pauses without double periods
  text = text.replace(/([.!?])\s*<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '$1 ');
  text = text.replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '. ');
  text = text.replace(/([.!?])\s*<(br|hr)\s*\/?>/gi, '$1 ');
  text = text.replace(/<(br|hr)\s*\/?>/gi, '. ');

  // 3. Chemical formulas & Subscripts
  // Handle HTML <sub> tags: H<sub>2</sub>O -> H 2 O
  text = text.replace(/<sub>(\d+)<\/sub>/gi, ' $1 ');
  text = text.replace(/<sub>([a-zA-Z0-9]+)<\/sub>/gi, ' $1 ');

  // Handle Unicode subscripts: ₀-₉ -> digits with spaces
  const unicodeSubMap: Record<string, string> = {
    '₀': ' 0 ', '₁': ' 1 ', '₂': ' 2 ', '₃': ' 3 ', '₄': ' 4 ',
    '₅': ' 5 ', '₆': ' 6 ', '₇': ' 7 ', '₈': ' 8 ', '₉': ' 9 '
  };
  text = text.replace(/[₀-₉]/g, match => unicodeSubMap[match] || match);

  // 4. Superscripts & Ionic charges
  // e.g. <sup>2+</sup> -> " 2 plus ", <sup>-</sup> -> " minus "
  text = text.replace(/<sup>(\d+)\+<\/sup>/gi, ' $1 plus ');
  text = text.replace(/<sup>(\d+)-<\/sup>/gi, ' $1 minus ');
  text = text.replace(/<sup>\+<\/sup>/gi, ' plus ');
  text = text.replace(/<sup>-<\/sup>/gi, ' minus ');
  text = text.replace(/<sup>(\d+)<\/sup>/gi, ' to the $1 ');
  text = text.replace(/<sup>([^<]+)<\/sup>/gi, ' $1 ');

  // Unicode superscripts: ⁺, ⁻, ², ³, etc.
  text = text.replace(/²⁺/g, ' 2 plus ');
  text = text.replace(/³⁺/g, ' 3 plus ');
  text = text.replace(/⁺/g, ' plus ');
  text = text.replace(/⁻/g, ' minus ');
  text = text.replace(/²/g, ' squared ');
  text = text.replace(/³/g, ' cubed ');
  const unicodeSupMap: Record<string, string> = {
    '⁰': ' to the 0 ', '¹': ' to the 1 ', '⁴': ' to the 4th ', '⁵': ' to the 5th ',
    '⁶': ' to the 6th ', '⁷': ' to the 7th ', '⁸': ' to the 8th ', '⁹': ' to the 9th '
  };
  text = text.replace(/[⁰¹⁴-⁹]/g, match => unicodeSupMap[match] || match);

  // 5. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // 6. Markdown formatting cleanup
  text = text
    .replace(/```[\s\S]*?```/g, ' ') // Strip multi-line code blocks
    .replace(/`([^`]+)`/g, ' $1 ')   // Inline code -> plain text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold **
    .replace(/\*([^*]+)\*/g, '$1')     // Italic *
    .replace(/__([^_]+)__/g, '$1')     // Bold __
    .replace(/_([^_]+)_/g, '$1')       // Italic _
    .replace(/~~([^~]+)~~/g, '$1')     // Strikethrough
    .replace(/^#+\s+/gm, '')           // Headings
    .replace(/^\s*[-*+]\s+/gm, '. ')   // Unordered list items -> pauses
    .replace(/^\s*\d+\.\s+/gm, '. ');  // Numbered list items -> pauses

  // 7. Scientific & Math symbols pronunciation
  text = text
    .replace(/&Delta;|Δ/g, ' delta ')
    .replace(/&alpha;|α/g, ' alpha ')
    .replace(/&beta;|β/g, ' beta ')
    .replace(/&gamma;|γ/g, ' gamma ')
    .replace(/&lambda;|λ/g, ' lambda ')
    .replace(/&pi;|π/g, ' pi ')
    .replace(/&theta;|θ/g, ' theta ')
    .replace(/&mu;|μ/g, ' micro ')
    .replace(/&le;|≤/g, ' is less than or equal to ')
    .replace(/&ge;|≥/g, ' is greater than or equal to ')
    .replace(/&ne;|≠/g, ' is not equal to ')
    .replace(/&approx;|≈/g, ' is approximately ')
    .replace(/&plusmn;|±/g, ' plus or minus ')
    .replace(/⇌|<=>|<->/g, ' is in equilibrium with ')
    .replace(/&#8594;|&rarr;|→|-->|->/g, ' yields ')
    .replace(/×/g, ' times ');

  // Scientific notation: 10^8 or 10^ -3 or 3.0 x 10^8
  text = text.replace(/\b10\^([+-]?\d+)\b/g, '10 to the $1');

  // Temperature and units
  text = text
    .replace(/(\d+)\s*°\s*C\b/gi, '$1 degrees Celsius')
    .replace(/(\d+)\s*°\s*F\b/gi, '$1 degrees Fahrenheit')
    .replace(/°\s*C\b/gi, ' degrees Celsius')
    .replace(/°\s*F\b/gi, ' degrees Fahrenheit')
    .replace(/°/g, ' degrees ')
    .replace(/\b(\d+(?:\.\d+)?)\s*kJ\/mol\b/gi, '$1 kilojoules per mole')
    .replace(/\bkJ\/mol\b/gi, 'kilojoules per mole')
    .replace(/\b(\d+(?:\.\d+)?)\s*J\/mol\b/gi, '$1 joules per mole')
    .replace(/\bJ\/mol\b/gi, 'joules per mole')
    .replace(/\b(\d+(?:\.\d+)?)\s*g\/mol\b/gi, '$1 grams per mole')
    .replace(/\bg\/mol\b/gi, 'grams per mole')
    .replace(/\b(\d+(?:\.\d+)?)\s*m\/s\^2\b/gi, '$1 meters per second squared')
    .replace(/\b(\d+(?:\.\d+)?)\s*m\/s²\b/gi, '$1 meters per second squared')
    .replace(/\bm\/s²\b/gi, 'meters per second squared')
    .replace(/\b(\d+(?:\.\d+)?)\s*m\/s\b/gi, '$1 meters per second')
    .replace(/\bm\/s\b/gi, 'meters per second')
    .replace(/\b(\d+(?:\.\d+)?)\s*mL\b/g, '$1 milliliters')
    .replace(/\b(\d+(?:\.\d+)?)\s*μm\b/g, '$1 micrometers')
    .replace(/\b(\d+(?:\.\d+)?)\s*nm\b/g, '$1 nanometers')
    .replace(/\b(\d+(?:\.\d+)?)\s*cm³\b/g, '$1 cubic centimeters')
    .replace(/\b(\d+(?:\.\d+)?)\s*kg\b/g, '$1 kilograms')
    .replace(/\b(\d+(?:\.\d+)?)\s*mg\b/g, '$1 milligrams')
    .replace(/\b(\d+(?:\.\d+)?)\s*kPa\b/gi, '$1 kilopascals')
    .replace(/\b(\d+(?:\.\d+)?)\s*atm\b/gi, '$1 atmospheres')
    .replace(/\b(\d+(?:\.\d+)?)\s*M\b/g, '$1 molar')
    .replace(/\bpH\b/g, 'p H');

  // 8. Chemical formulas spacing:
  // Convert formulas like H2O -> H 2 O, CO2 -> C O 2, CH4 -> C H 4 so the speech synth doesn't stumble
  text = text.replace(/\b([A-Z][a-z]?)([0-9]+)\b/g, '$1 $2');
  // Common multi-element formulas with numbers e.g. H 2 O 2, C 6 H 12 O 6
  text = text.replace(/\b([A-Z][a-z]?)\s*([0-9]+)\s*([A-Z][a-z]?)\s*([0-9]+)\b/g, '$1 $2 $3 $4');
  // Common 2-element binary salts that shouldn't be slurred e.g. NaCl -> N a C l, HCl -> H C l
  text = text.replace(/\bNaCl\b/g, 'N a C l');
  text = text.replace(/\bHCl\b/g, 'H C l');
  text = text.replace(/\bNaOH\b/g, 'N a O H');
  text = text.replace(/\bKOH\b/g, 'K O H');
  text = text.replace(/\bCaCl2\b/g, 'Ca C l 2');

  // 9. Punctuation and spacing cleanup
  text = text
    .replace(/[—–]/g, ', ')         // Replace em/en dashes with comma pauses
    .replace(/([.!?])\s*\./g, '$1') // Avoid double periods like ?. or !.
    .replace(/\.{2,}/g, '.')        // Collapse multiple dots e.g. .. -> .
    .replace(/,\s*,+/g, ', ')       // Collapse multiple commas
    .replace(/\s+/g, ' ')           // Collapse spaces
    .replace(/\s+([.,!?;:])/g, '$1')// Fix space before punctuation
    .trim();

  return text;
}

/**
 * Score a speech synthesis voice based on naturalness and audio quality.
 * Higher score = more human and natural sounding.
 * Negative score = robotic, novelty, or non-English voice.
 */
export function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  // English only for this application
  if (!lang.startsWith('en')) {
    return -100;
  }

  // Severely penalize or reject known legacy/robotic/novelty synth voices
  const roboticVoices = [
    'fred', 'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles',
    'cellos', 'deranged', 'good news', 'hysterical', 'pipe organ',
    'trinoids', 'whisper', 'zarvox', 'espeak', 'ralph', 'junior',
    'princess', 'organ', 'sin-ji', 'ting-ting'
  ];
  if (roboticVoices.some(r => name.includes(r))) {
    return -50;
  }

  // 1. Edge / Azure Online Natural voices (state of the art in browser TTS)
  if (name.includes('natural') || name.includes('online')) {
    score += 100;
  }

  // 2. Enhanced / Premium OS neural voices (macOS / iOS / Windows)
  if (name.includes('enhanced') || name.includes('premium') || name.includes('neural')) {
    score += 85;
  }

  // 3. Google Chrome high-fidelity voices
  if (name.includes('google')) {
    score += 65;
    if (name.includes('us english') || name.includes('uk english')) {
      score += 15;
    }
  }

  // 4. Well-regarded natural Apple voices
  const appleFavorites = [
    'samantha', 'ava', 'nicky', 'daniel', 'alex', 'karen', 'serena',
    'moira', 'tom', 'oliver', 'rishi', 'siri'
  ];
  if (appleFavorites.some(fav => name.includes(fav))) {
    score += 45;
  }

  // 5. Microsoft desktop natural voices
  const msFavorites = ['jenny', 'guy', 'aria', 'zira', 'david', 'mark'];
  if (msFavorites.some(ms => name.includes(ms))) {
    score += 30;
  }

  // 6. Accent preferences: US and UK English are standard in science curricula
  if (lang === 'en-us') {
    score += 10;
  } else if (lang === 'en-gb') {
    score += 8;
  } else if (lang.startsWith('en-')) {
    score += 5;
  }

  return score;
}

/**
 * Filter available voices to English natural voices suitable for human listening,
 * sorted from highest to lowest quality.
 */
export function getAvailableNaturalVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .filter(v => scoreVoice(v) > 0)
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

/**
 * Get the best available voice, respecting user preference if stored.
 */
export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  preferredUri?: string | null
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. If preferred voice exists in available voices, use it
  if (preferredUri) {
    const match = voices.find(v => v.voiceURI === preferredUri || v.name === preferredUri);
    if (match) return match;
  }

  // 2. Otherwise sort by quality score and pick the top voice
  const scored = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  if (scored.length > 0 && scoreVoice(scored[0]) > 0) {
    return scored[0];
  }

  // 3. Fallback to first English voice or default
  const englishFallback = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  return englishFallback || voices[0] || null;
}

/**
 * Get persisted user settings for TTS.
 */
export function getStoredTTSSettings(): SpeechSettings {
  if (typeof window === 'undefined') {
    return { voiceUri: null, rate: DEFAULT_RATE };
  }

  try {
    const voiceUri = localStorage.getItem(STORAGE_KEY_VOICE);
    const storedRate = localStorage.getItem(STORAGE_KEY_RATE);
    const parsedRate = storedRate ? parseFloat(storedRate) : DEFAULT_RATE;
    const rate = !isNaN(parsedRate) && parsedRate >= 0.5 && parsedRate <= 1.5 ? parsedRate : DEFAULT_RATE;
    return { voiceUri, rate };
  } catch {
    return { voiceUri: null, rate: DEFAULT_RATE };
  }
}

/**
 * Store user TTS settings.
 */
export function setStoredTTSSettings(settings: Partial<SpeechSettings>): void {
  if (typeof window === 'undefined') return;

  try {
    if (settings.voiceUri !== undefined) {
      if (settings.voiceUri) {
        localStorage.setItem(STORAGE_KEY_VOICE, settings.voiceUri);
      } else {
        localStorage.removeItem(STORAGE_KEY_VOICE);
      }
    }
    if (settings.rate !== undefined) {
      localStorage.setItem(STORAGE_KEY_RATE, String(settings.rate));
    }
  } catch (err) {
    console.warn('Could not save TTS settings:', err);
  }
}

/**
 * Splits text into sentence chunks to avoid the 15-second speech synthesis
 * freeze bug in Chromium and Safari.
 */
export function chunkTextIntoSentences(text: string, maxChunkLength = 160): string[] {
  if (!text) return [];

  // Split on sentence-ending punctuation followed by whitespace
  const rawSentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  const chunks: string[] = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLength) {
      chunks.push(trimmed);
    } else {
      // Split on clauses (commas, semicolons) if a single sentence is very long
      const clauses = trimmed.match(/[^,;:]+[,;:]+(\s+|$)|[^,;:]+$/g) || [trimmed];
      let currentChunk = '';

      for (const clause of clauses) {
        const clauseTrimmed = clause.trim();
        if (!clauseTrimmed) continue;

        if (currentChunk.length + clauseTrimmed.length + 1 <= maxChunkLength) {
          currentChunk = currentChunk ? `${currentChunk} ${clauseTrimmed}` : clauseTrimmed;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = clauseTrimmed;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
  }

  return chunks.length > 0 ? chunks : [text];
}
