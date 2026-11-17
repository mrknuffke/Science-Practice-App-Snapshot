import { Type } from "@google/genai";
import { CourseType, WhoAmIPuzzle } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

export interface GetWhoAmIPuzzlesOptions {
    /** Used by per-puzzle Make Easier / Make Harder in the preview view. */
    difficultyAdjustment?: 'easier' | 'harder';
    /** Overall deck difficulty bias: 'easier' | 'mixed' | 'harder'. */
    difficultyMix?: 'easier' | 'mixed' | 'harder';
    /** 0–100 fun/silliness level (0 = standard, 100 = maximum chaos). */
    silliness?: number;
    /** Optional source material pasted or uploaded by the teacher. */
    sourceContext?: string;
}

export const getWhoAmIPuzzles = async (
    course: CourseType,
    topic: string,
    count: number = 5,
    options?: GetWhoAmIPuzzlesOptions | 'easier' | 'harder'
): Promise<WhoAmIPuzzle[]> => {
    try {
        const ctx = getCourseContext(course);

        // Normalise options — the 4th param was formerly a plain 'easier'|'harder' string
        // used by handleRegenerateWhoAmIClues in App.tsx. Accept both old and new shapes.
        const opts: GetWhoAmIPuzzlesOptions = typeof options === 'string'
            ? { difficultyAdjustment: options }
            : (options ?? {});

        // Per-puzzle difficulty override (Make Easier / Make Harder in preview)
        let difficultyInstruction = '';
        if (opts.difficultyAdjustment === 'easier') {
            difficultyInstruction = `\n\nDIFFICULTY ADJUSTMENT: Make this puzzle EASIER and more appropriate for students. Use simpler vocabulary, more common examples, and make the clues more straightforward and accessible. The entity should be a fundamental concept that students encounter early in their studies.`;
        } else if (opts.difficultyAdjustment === 'harder') {
            difficultyInstruction = `\n\nDIFFICULTY ADJUSTMENT: Make this puzzle MORE CHALLENGING and advanced. Use technical vocabulary, advanced concepts, and more subtle clues. The entity should be a more sophisticated or nuanced concept appropriate for advanced students.`;
        }

        // Deck-level difficulty mix
        let mixInstruction = '';
        if (opts.difficultyMix === 'easier') {
            mixInstruction = `\n\nDIFFICULTY MIX: The overall deck should lean EASY — simpler entities with accessible clue vocabulary. Good for younger students or introductory classes.`;
        } else if (opts.difficultyMix === 'harder') {
            mixInstruction = `\n\nDIFFICULTY MIX: The overall deck should lean HARD — advanced entities with technical clue vocabulary. Suitable for AP/honors level or review at the end of a unit.`;
        }

        // Silliness / fun factor
        let sillinessInstruction = '';
        const silliness = opts.silliness ?? 0;
        if (silliness > 66) {
            sillinessInstruction = `\n\nFUN FACTOR: Maximum chaos mode! Use puns, pop-culture analogies, unexpected comparisons, and humorous phrasing while keeping the science accurate.`;
        } else if (silliness > 33) {
            sillinessInstruction = `\n\nFUN FACTOR: Add light humour and puns to the clues where appropriate. Keep it educational but entertaining.`;
        } else if (silliness > 0) {
            sillinessInstruction = `\n\nFUN FACTOR: Friendly, conversational tone. Minimal emojis where helpful.`;
        }

        // Source context
        const sourceBlock = opts.sourceContext
            ? `\n\nSOURCE MATERIAL (use this to ground the puzzles):\n${opts.sourceContext}`
            : '';

        const prompt = `
      ${ctx.role}
      Course: ${course}
      Topic: "${topic}"
      Standard: ${ctx.standard}
      Complexity: ${ctx.complexity}${difficultyInstruction}${mixInstruction}${sillinessInstruction}${sourceBlock}

      TASK:
      Generate ${count} "Who Am I?" style guessing game puzzles based on the topic.
      The answer ("entity") can be a famous scientist, a specific element, a core vocabulary term, a biological process, a physical law, etc.

      For each entity, define EXACTLY 5 progressive clues.
      - Clue 1: Very difficult, obscure, or broad.
      - Clue 2: Difficult.
      - Clue 3: Medium difficulty.
      - Clue 4: Easy.
      - Clue 5: Very easy, almost a giveaway.

      Also provide a "factoid" which is a fun, interesting 1-sentence fact about the entity to display after the answer is revealed.

      RULES:
      1. Ensure the clues are accurate and educational.
      2. Do not use the entity's name in the clues.
      3. Keep clues concise (1-2 sentences max).

      OUTPUT FORMAT:
      Return a JSON object with a "puzzles" array.
    `;

        const response = await callAI(DEFAULT_MODEL, prompt, {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    puzzles: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                entity: { type: Type.STRING, description: "The answer to the puzzle" },
                                clues: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "Exactly 5 progressive clues from hardest to easiest"
                                },
                                factoid: { type: Type.STRING, description: "A fun fact to display after reveal" }
                            },
                            required: ["entity", "clues", "factoid"]
                        }
                    }
                },
                required: ["puzzles"]
            }
        });

        const cleanText = cleanJsonResponse(response.text || "");
        const result: { puzzles?: WhoAmIPuzzle[] } = JSON.parse(cleanText || "{\"puzzles\": []}");

        if (!result.puzzles || result.puzzles.length === 0) return [];

        return result.puzzles.map((p, i) => ({
            ...p,
            id: `whoami-${i}-${Date.now()}`
        }));

    } catch (err) {
        console.error("Who Am I puzzle generation failed:", err);
        throw err;
    }
};

const SINGLE_PUZZLE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        entity: { type: Type.STRING },
        clues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 5,
            maxItems: 5
        },
        factoid: { type: Type.STRING }
    },
    required: ["entity", "clues", "factoid"]
};

/** A model reply that should hold one puzzle; any field may be missing or the wrong type. */
interface RawPuzzle {
    entity?: unknown;
    clues?: unknown;
    factoid?: unknown;
}

const normalizePuzzle = (raw: RawPuzzle | null | undefined, fallbackId?: string): WhoAmIPuzzle => {
    const clues: string[] = Array.isArray(raw?.clues) ? raw.clues.slice(0, 5).map(String) : [];
    while (clues.length < 5) clues.push("(clue placeholder — please refresh)");
    return {
        id: fallbackId || `whoami-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        entity: typeof raw?.entity === "string" && raw.entity ? raw.entity : "Untitled",
        clues,
        factoid: typeof raw?.factoid === "string" ? raw.factoid : ""
    };
};

export const reviseWhoAmIPuzzle = async (
    course: CourseType,
    topic: string,
    puzzle: WhoAmIPuzzle,
    teacherNotes: string
): Promise<WhoAmIPuzzle> => {
    const ctx = getCourseContext(course);
    const prompt = `
${ctx.role}
Course: ${course}
Topic: "${topic}"
Standard: ${ctx.standard}

You are revising an existing "Who Am I?" puzzle based on teacher feedback.

CURRENT PUZZLE:
Entity: ${puzzle.entity}
Clues:
${puzzle.clues.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}
Factoid: ${puzzle.factoid || ''}

TEACHER NOTES:
"${teacherNotes}"

TASK:
Revise the puzzle per the teacher's notes. You may keep the same entity or pick a different one if the notes call for it.
- Output exactly 5 clues, ordered hardest (1) to easiest (5).
- Do not use the entity name in any clue.
- Keep clues concise (1-2 sentences each).
- Provide a short, fun factoid.

Return a single JSON object.`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: SINGLE_PUZZLE_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    return normalizePuzzle(parsed, puzzle.id);
};

export const addOneWhoAmIPuzzle = async (
    course: CourseType,
    topic: string,
    existingEntities: string[]
): Promise<WhoAmIPuzzle> => {
    const ctx = getCourseContext(course);
    const prompt = `
${ctx.role}
Course: ${course}
Topic: "${topic}"
Standard: ${ctx.standard}

Generate ONE new "Who Am I?" puzzle for this topic.

AVOID these entities (already used):
${existingEntities.map(e => `- ${e}`).join('\n')}

REQUIREMENTS:
- Entity must be different from all listed above (different concept, not just different wording).
- Provide exactly 5 clues, ordered hardest (1) to easiest (5).
- Do not use the entity name in any clue.
- Keep clues concise.
- Include a short factoid.

Return a single JSON object.`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: SINGLE_PUZZLE_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || "{}"));
    return normalizePuzzle(parsed);
};

const SINGLE_CLUE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        clue: { type: Type.STRING }
    },
    required: ["clue"]
};

const difficultyLabel = (slotIndex: number): string => {
    const labels = ['very hard (obscure/broad)', 'hard', 'medium', 'easy', 'very easy (near giveaway)'];
    return labels[Math.min(slotIndex, labels.length - 1)];
};

export const refreshWhoAmIClue = async (
    course: CourseType,
    puzzle: WhoAmIPuzzle,
    clueIndex: number,
): Promise<string> => {
    const difficulty = difficultyLabel(clueIndex);
    const prompt = `
Course: ${course}
Topic context: puzzle entity is "${puzzle.entity}"

Generate ONE replacement clue for clue position ${clueIndex + 1} of a "Who Am I?" puzzle.
This position should be ${difficulty}.

EXISTING CLUES (for context — do not duplicate):
${puzzle.clues.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

REQUIREMENTS:
- The clue must be for position ${clueIndex + 1} (difficulty: ${difficulty}).
- Do NOT use the entity name "${puzzle.entity}" or obvious variants in the clue.
- Keep it concise (1-2 sentences).
- It must be factually accurate.

Return a JSON object with a single "clue" string.`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: SINGLE_CLUE_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return (parsed?.clue as string) || '(clue placeholder — try regenerating)';
};

export const addOneWhoAmIClue = async (
    course: CourseType,
    puzzle: WhoAmIPuzzle,
    desiredDifficultySlot: number,
): Promise<string> => {
    const difficulty = difficultyLabel(desiredDifficultySlot - 1);
    const prompt = `
Course: ${course}
Topic context: puzzle entity is "${puzzle.entity}"

Generate ONE NEW clue for a "Who Am I?" puzzle that doesn't duplicate any existing clue.
Desired difficulty: ${difficulty} (slot position ${desiredDifficultySlot}).

EXISTING CLUES (do not duplicate any of these):
${puzzle.clues.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

REQUIREMENTS:
- Do NOT use the entity name "${puzzle.entity}" or obvious variants.
- Keep it concise (1-2 sentences).
- Must be factually accurate and distinctly different from the existing clues above.
- Difficulty level should be approximately: ${difficulty}.

Return a JSON object with a single "clue" string.`;

    const response = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json",
        responseSchema: SINGLE_CLUE_SCHEMA
    });
    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return (parsed?.clue as string) || '(new clue — edit to customise)';
};
