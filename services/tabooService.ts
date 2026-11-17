import { Type } from "@google/genai";
import { CourseType, TabooCard, TabooDeck } from '../types';
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from './ai/core';

const buildCardSchema = (forbiddenCount: number) => ({
    type: Type.OBJECT,
    properties: {
        term: { type: Type.STRING },
        category: { type: Type.STRING },
        forbiddenWords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: forbiddenCount,
            maxItems: forbiddenCount
        }
    },
    required: ["term", "category", "forbiddenWords"]
});

const buildDeckSchema = (forbiddenCount: number) => ({
    type: Type.OBJECT,
    properties: {
        cards: {
            type: Type.ARRAY,
            items: buildCardSchema(forbiddenCount)
        }
    },
    required: ["cards"]
});

const newId = () => `taboo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** A card as the model returned it: any field may be missing or the wrong type. */
interface RawTabooCard {
    term?: unknown;
    category?: unknown;
    forbiddenWords?: unknown;
}

const normalizeCard = (raw: RawTabooCard | null | undefined, forbiddenCount: number, fallbackCategory: string): TabooCard => {
    const fw: string[] = Array.isArray(raw?.forbiddenWords) ? raw.forbiddenWords.map((w: unknown) => String(w).trim()).filter(Boolean) : [];
    while (fw.length < forbiddenCount) fw.push('(add forbidden word)');
    return {
        id: newId(),
        term: String(raw?.term || 'Untitled').trim(),
        category: String(raw?.category || fallbackCategory).trim(),
        forbiddenWords: fw.slice(0, forbiddenCount)
    };
};

export const generateTabooDeck = async (
    course: CourseType | string,
    topic: string,
    gradeLevel: string,
    count: number,
    forbiddenCount: number
): Promise<TabooDeck> => {
    const prompt = `
You are a science teacher building a Taboo deck for a classroom review game.
Course: ${course}
Grade Level: ${gradeLevel}
Topic: "${topic}"

TASK:
Generate exactly ${count} unique Taboo cards. Each card has:
- "term": ONE target word/short phrase the clue-giver wants their team to say (1-3 words).
- "category": a 1-3 word topical label.
- "forbiddenWords": exactly ${forbiddenCount} words that the clue-giver may NOT say while giving clues.

RULES FOR forbiddenWords:
- Include the most obvious clues for the term — synonyms, common analogies, the words that
  appear in the textbook definition's first sentence.
- Include morphological variants of the term (e.g. for "photosynthesis": photosynthesize,
  photosynthesizing, photosynthetic).
- Each forbidden word must be a single word OR a very short phrase (≤3 words).
- All ${forbiddenCount} entries must be distinct from each other AND from the term itself.
- Stay strictly within the topic — no off-topic distractors.

GENERAL RULES:
- All ${count} terms must be UNIQUE across the deck.
- No profanity, brand names, or proper nouns of living people.

OUTPUT: a JSON object with a "cards" array of exactly ${count} entries.
`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: buildDeckSchema(forbiddenCount)
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    const rawCards = Array.isArray(parsed?.cards) ? parsed.cards : [];

    const seen = new Set<string>();
    const cards: TabooCard[] = [];
    for (const r of rawCards) {
        const card = normalizeCard(r, forbiddenCount, topic);
        const key = card.term.toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        cards.push(card);
        if (cards.length >= count) break;
    }
    while (cards.length < count) {
        cards.push({
            id: newId(),
            term: `(replace me — placeholder ${cards.length + 1})`,
            category: topic,
            forbiddenWords: Array(forbiddenCount).fill('(add forbidden word)')
        });
    }

    return {
        id: `deck-${Date.now()}`,
        title: `${course}: ${topic}`,
        course: String(course),
        topic,
        gradeLevel,
        forbiddenCount,
        cards,
        createdAt: Date.now()
    };
};

export const refreshTabooCard = async (
    course: CourseType | string,
    topic: string,
    gradeLevel: string,
    forbiddenCount: number,
    existingTerms: string[],
    teacherNotes: string = ''
): Promise<TabooCard> => {
    const prompt = `
Generate ONE replacement Taboo card.
Course: ${course}
Grade Level: ${gradeLevel}
Topic: "${topic}"

AVOID these terms (already in the deck):
${existingTerms.map(t => `- ${t}`).join('\n')}

${teacherNotes ? `TEACHER NOTES: ${teacherNotes}\n` : ''}
Provide a JSON object with: term, category, forbiddenWords (exactly ${forbiddenCount} entries).
Forbidden words: most obvious clues + morphological variants of the term. No duplicates.
`;
    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: buildCardSchema(forbiddenCount)
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    return normalizeCard(parsed, forbiddenCount, topic);
};

export const reviseTabooCard = async (
    course: CourseType | string,
    topic: string,
    forbiddenCount: number,
    card: TabooCard,
    teacherNotes: string
): Promise<TabooCard> => {
    const prompt = `
Revise an existing Taboo card per teacher notes.
Course: ${course}
Topic: "${topic}"

CURRENT CARD:
- term: ${card.term}
- category: ${card.category}
- forbiddenWords: ${card.forbiddenWords.join(', ')}

TEACHER NOTES:
"${teacherNotes}"

Apply the notes. Keep the term if it still fits, or substitute a closely-related on-topic alternative.
forbiddenWords must contain exactly ${forbiddenCount} entries — most obvious clues + morphological variants.
Return a single raw JSON object: term, category, forbiddenWords.
`;
    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: buildCardSchema(forbiddenCount)
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    const revised = normalizeCard(parsed, forbiddenCount, card.category);
    return { ...revised, id: card.id };
};

// --- Library ---

const LIBRARY_KEY = 'sp_taboo_lib_v1';

export const getSavedTabooDecks = (): TabooDeck[] => {
    try {
        const raw = localStorage.getItem(LIBRARY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveTabooDeck = (deck: TabooDeck): void => {
    const all = getSavedTabooDecks();
    const next = [deck, ...all.filter(d => d.id !== deck.id)].slice(0, 50);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
};

export const deleteTabooDeck = (id: string): void => {
    const next = getSavedTabooDecks().filter(d => d.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
};
