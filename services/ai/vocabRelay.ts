import { Type } from '@google/genai';
import { CourseType } from '../../types';
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from './core';
import { RelayCard, RelayDeck } from '../../components/relay/relayTypes';
import { RELAY_PRESETS } from '../../components/relay/relayPresets';

interface RawRelayCard {
  term?: string;
  category?: string;
  definition?: string;
  clueKeywords?: string[];
  tabooWords?: string[];
  formulaOrEquation?: string;
  options?: string[];
}

const relayCardSchema = {
  type: Type.OBJECT,
  properties: {
    term: { type: Type.STRING },
    category: { type: Type.STRING },
    definition: { type: Type.STRING },
    clueKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 4,
    },
    tabooWords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 5,
    },
    formulaOrEquation: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: 4,
      maxItems: 4,
    },
  },
  required: ['term', 'category', 'definition', 'clueKeywords', 'tabooWords', 'options'],
};

const relayDeckSchema = {
  type: Type.OBJECT,
  properties: {
    cards: {
      type: Type.ARRAY,
      items: relayCardSchema,
    },
  },
  required: ['cards'],
};

export async function generateRelayDeck(
  course: CourseType,
  topic: string,
  count: number = 8
): Promise<RelayDeck> {
  const ctx = getCourseContext(course);

  const prompt = `
${ctx.role}
You are generating a competitive science vocabulary relay deck for a high-energy classroom review game.
Course: ${course}
Topic: "${topic}"

TASK:
Generate exactly ${count} curriculum-aligned science vocabulary terms for this topic.
For each term, provide:
- "term": The authentic scientific keyword or law (e.g. "ATP Synthase", "Le Chatelier's Principle").
- "category": Sub-unit or concept branch.
- "definition": A rigorous, accurate 1-sentence scientific definition.
- "clueKeywords": Exactly 3 to 4 technical keywords or clues that describe the mechanism.
- "tabooWords": 3 to 5 forbidden root words that callers cannot say when describing the term.
- "formulaOrEquation": (Optional) The relevant chemical or physical equation, or empty string.
- "options": An array of 4 plausible scientific terms from this unit (including the correct term itself) for rapid choice mode.

STRICT WRITING RULES:
- Do not use em-dashes anywhere in your output.
- All terms must be authentic to ${course}.
`;

  try {
    const raw = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: 'application/json',
      responseSchema: relayDeckSchema,
      temperature: 0.3,
    });

    const responseText = (typeof raw === 'string' ? raw : raw?.text) || '';
    const cleaned = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed?.cards) && parsed.cards.length > 0) {
      const cards: RelayCard[] = parsed.cards.map((c: RawRelayCard, idx: number) => ({
        id: `gen-${Date.now()}-${idx}`,
        term: String(c.term || 'Untitled').trim().replace(/[—–]/g, '-'),
        category: String(c.category || topic).trim(),
        definition: String(c.definition || '').trim().replace(/[—–]/g, '-'),
        clueKeywords: Array.isArray(c.clueKeywords)
          ? c.clueKeywords.map((k: string) => String(k).trim())
          : [],
        tabooWords: Array.isArray(c.tabooWords)
          ? c.tabooWords.map((t: string) => String(t).trim())
          : [],
        formulaOrEquation: c.formulaOrEquation ? String(c.formulaOrEquation).trim() : undefined,
        options: Array.isArray(c.options) && c.options.length >= 4
          ? c.options.slice(0, 4).map((o: string) => String(o).trim())
          : [String(c.term || 'Term'), 'Alternative A', 'Alternative B', 'Alternative C'],
      }));

      return {
        id: `deck-${Date.now()}`,
        title: `${topic} Vocabulary Relay`,
        course,
        topic,
        cards,
      };
    }
  } catch (error) {
    console.warn('[generateRelayDeck] AI deck generation failed, utilizing preset fallback:', error);
  }

  // Fallback to matching preset or first preset
  const matched = RELAY_PRESETS.find(p => p.course === course) || RELAY_PRESETS[0];
  return {
    ...matched,
    title: `${topic || matched.topic} (Curated Relay)`,
    topic: topic || matched.topic,
  };
}
