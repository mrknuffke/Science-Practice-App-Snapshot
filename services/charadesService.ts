import { Type } from "@google/genai";
import { CourseType, CharadesCard, CharadesDeck, CharadesDifficulty, CharadesGameMode } from '../types';
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from './ai/core';

const CARD_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        term: { type: Type.STRING },
        category: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        hint: { type: Type.STRING }
    },
    required: ["term", "category", "difficulty"]
};

const DECK_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        cards: {
            type: Type.ARRAY,
            items: CARD_SCHEMA
        }
    },
    required: ["cards"]
};

const normalizeDifficulty = (d: unknown): CharadesDifficulty => {
    const lower = String(d || '').toLowerCase();
    if (lower === 'easy' || lower === 'medium' || lower === 'hard') return lower;
    return 'medium';
};

const newId = () => `charades-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** A card as the model returned it: any field may be missing or the wrong type. */
interface RawCharadesCard {
    term?: unknown;
    category?: unknown;
    difficulty?: unknown;
    hint?: unknown;
}

const normalizeCard = (raw: RawCharadesCard | null | undefined, fallbackCategory: string): CharadesCard => ({
    id: newId(),
    term: String(raw?.term || 'Untitled').trim(),
    category: String(raw?.category || fallbackCategory).trim(),
    difficulty: normalizeDifficulty(raw?.difficulty),
    hint: raw?.hint ? String(raw.hint).trim() : undefined
});

const normalizeCards = (rawCards: unknown, requested: number, fallbackCategory: string): CharadesCard[] => {
    const arr: RawCharadesCard[] = Array.isArray(rawCards) ? rawCards : [];
    const seen = new Set<string>();
    const cleaned: CharadesCard[] = [];
    for (const r of arr) {
        const card = normalizeCard(r, fallbackCategory);
        const key = card.term.toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        cleaned.push(card);
        if (cleaned.length >= requested) break;
    }
    while (cleaned.length < requested) {
        cleaned.push({
            id: newId(),
            term: `(replace me — placeholder ${cleaned.length + 1})`,
            category: fallbackCategory,
            difficulty: 'medium'
        });
    }
    return cleaned;
};

export const generateCharadesDeck = async (
    course: CourseType | string,
    topic: string,
    gradeLevel: string,
    count: number,
    difficultyMix: 'easy' | 'mixed' | 'hard',
    gameMode: CharadesGameMode = 'charades'
): Promise<CharadesDeck> => {
    const mixDescription = difficultyMix === 'easy'
        ? "Lean toward EASY cards (~70% easy, 30% medium, 0% hard)."
        : difficultyMix === 'hard'
            ? "Lean toward HARD cards (~10% easy, 30% medium, 60% hard)."
            : "Even mix across difficulties (~33% each).";

    const modeBlock = gameMode === 'pictionary' ? `
You are building a PICTIONARY deck for a classroom review game.
Each card lists ONE term that a student can DRAW on a whiteboard within ~60 seconds, without speaking
or writing letters. Pictionary terms must be visually representable.

DIFFICULTY:
${mixDescription}
- "easy" terms = concrete nouns or simple shapes (e.g. "leaf", "atom", "volcano").
- "medium" terms = recognizable objects or simple processes (e.g. "mitochondrion", "magnet").
- "hard" terms = abstract or multi-stage concepts that require a mini diagram (e.g. "natural selection",
  "phase change", "Doppler effect").

PICTIONARY-SPECIFIC RULES:
- Avoid abstract terms with no visual hook (e.g. "uncertainty", "dimensionless quantity") — pick a
  drawable analog instead.
- Prefer terms that have a canonical textbook diagram.` : `
You are building a CHARADES deck for a classroom review game.
Each card lists ONE term that a student can act out without speaking.

DIFFICULTY:
${mixDescription}
- "easy" terms = nouns / processes that have an obvious physical motion (e.g. "diffusion", "earthquake").
- "medium" terms = familiar concepts that need creative pantomime (e.g. "mitochondrion", "convection").
- "hard" terms = abstract concepts requiring multi-part charades (e.g. "natural selection", "entropy").`;

    const prompt = `
${modeBlock}
Course: ${course}
Grade Level: ${gradeLevel}
Topic: "${topic}"

TASK:
Generate exactly ${count} unique cards. Include a short category label and an optional one-line hint
for the player.

GENERAL RULES:
- Each "term" must be 1-4 words. No definitions. No long phrases.
- All terms must be UNIQUE. Do not repeat or use synonyms of the same concept.
- "category" should be a 1-3 word topical label (e.g. "Cell Biology", "Mechanics").
- "hint" (optional) is a single short tip for the player — must NOT contain the term.
- Do NOT include profanity, brand names, or proper nouns of living people.

OUTPUT: a JSON object with a "cards" array of exactly ${count} entries.
`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: DECK_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    const cards = normalizeCards(parsed?.cards, count, topic);

    return {
        id: `deck-${Date.now()}`,
        title: `${course}: ${topic}`,
        course: String(course),
        topic,
        gradeLevel,
        gameMode,
        cards,
        createdAt: Date.now()
    };
};

export const refreshCharadesCard = async (
    course: CourseType | string,
    topic: string,
    gradeLevel: string,
    existingTerms: string[],
    teacherNotes: string = ''
): Promise<CharadesCard> => {
    const prompt = `
Generate ONE replacement Charades card.
Course: ${course}
Grade Level: ${gradeLevel}
Topic: "${topic}"

AVOID these terms (already in the deck):
${existingTerms.map(t => `- ${t}`).join('\n')}

${teacherNotes ? `TEACHER NOTES: ${teacherNotes}\n` : ''}
RULES:
- Term must be different from every entry above and 1-4 words.
- Include category, difficulty (easy | medium | hard), and an optional 1-line hint.
- The hint must NOT contain the term.

Return a single raw JSON object with keys: term, category, difficulty, hint.
`;
    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: CARD_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    return normalizeCard(parsed, topic);
};

export const reviseCharadesCard = async (
    course: CourseType | string,
    topic: string,
    card: CharadesCard,
    teacherNotes: string
): Promise<CharadesCard> => {
    const prompt = `
Revise an existing Charades card per teacher notes.
Course: ${course}
Topic: "${topic}"

CURRENT CARD:
- term: ${card.term}
- category: ${card.category}
- difficulty: ${card.difficulty}
- hint: ${card.hint || '(none)'}

TEACHER NOTES:
"${teacherNotes}"

TASK: Apply the teacher's notes. Keep the same term if it still fits, or substitute a closely related one
if the notes call for it. Always keep within the topic.

Return a single raw JSON object with keys: term, category, difficulty, hint.
`;
    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: CARD_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    const revised = normalizeCard(parsed, card.category);
    return { ...revised, id: card.id };
};

// --- Library (localStorage) ---

const LIBRARY_KEY = 'sp_charades_lib_v1';

export const getSavedCharadesDecks = (): CharadesDeck[] => {
    try {
        const raw = localStorage.getItem(LIBRARY_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const saveCharadesDeck = (deck: CharadesDeck): void => {
    const all = getSavedCharadesDecks();
    const next = [deck, ...all.filter(d => d.id !== deck.id)].slice(0, 50);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
};

export const deleteCharadesDeck = (id: string): void => {
    const next = getSavedCharadesDecks().filter(d => d.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
};
