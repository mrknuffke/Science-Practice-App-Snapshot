import { Type } from "@google/genai";
import { CourseType, Flashcard, FlashcardReport } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";
import { normalizeScientificNotation } from "../../utils/sanitize";

export const getFlashcards = async (
  course: CourseType,
  topics: string | string[], // UPDATED: Accept both single topic and array
  count: number = 15
): Promise<Flashcard[]> => {
  try {
    const ctx = getCourseContext(course);

    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];
    const topicString = topicArray.join(', ');

    // Build topic instruction
    const topicInstruction = topicArray.length > 1
      ? `Topics: "${topicString}"\n\nIMPORTANT: Generate flashcards covering ALL of these topics. Distribute cards evenly across topics.`
      : `Topic: "${topicArray[0]}"`;

    const prompt = `
      ${ctx.role}
      Course: ${course}
      ${topicInstruction}
      Standard: ${ctx.standard}
      Complexity: ${ctx.complexity}

      TASK:
      Generate ${count} flashcards for key terms, definitions, formulas, or concepts related to this topic.
      IMPORTANT: Generate a DIVERSE mix of the following flashcard types:
      - 'basic': A standard term and definition pairs.
      - 'cloze': The 'term' should be a sentence with a missing word replaced by "____". The 'definition' is the missing word.
      - 'true_false': The 'term' is a factual statement. The 'definition' must be verbatim "true" or "false" (capitalized "True" / "False" is also fine), accompanied by a brief explanation.
      - 'mcq': The 'term' is a multiple-choice question. The 'options' array should contain 4 plausible answers. The 'definition' is the correct answer and a brief explanation.

      RULES:
      1. Terms and definitions should be clear, accurate, and easy to memorize.
      2. For 'basic' equations, putting the name of equation as term and formula as definition is allowed.
      3. For chemical formulas and scientific notation, prefer clean standard notation (e.g. Zeff, H2O, CO2) or standard Markdown / LaTeX ($Z_{\\text{eff}}$, $\\text{CO}_2$). Avoid messy raw HTML tags.
      4. Ensure MCQ cards have exactly 4 options.

      OUTPUT FORMAT:
      Return a JSON object with a "flashcards" array.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "One of: basic, cloze, true_false, mcq" },
                term: { type: Type.STRING },
                definition: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Required ONLY for mcq type" },
                context: { type: Type.STRING, description: "A brief example or usage note" }
              },
              required: ["type", "term", "definition"]
            }
          }
        },
        required: ["flashcards"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { flashcards?: Flashcard[] } = JSON.parse(cleanText || "{\"flashcards\": []}");

    if (!result.flashcards || result.flashcards.length === 0) return [];

    return result.flashcards.map((f, i) => ({
      ...f,
      term: normalizeScientificNotation(f.term),
      definition: normalizeScientificNotation(f.definition),
      options: Array.isArray(f.options) ? f.options.map(normalizeScientificNotation) : undefined,
      context: f.context ? normalizeScientificNotation(f.context) : undefined,
      id: `fc-${i}-${Date.now()}`
    }));

  } catch (err) {
    console.error("Flashcard generation failed:", err);
    throw err;
  }
};

export const getFlashcardReport = async (
  course: CourseType,
  topic: string,
  missedTerms: string[]
): Promise<FlashcardReport> => {
  try {
    const ctx = getCourseContext(course);

    const prompt = `
      ${ctx.role}
    Topic: ${topic}

      The student just finished a matching quiz and struggled with the following terms:
      ${missedTerms.join(', ')}

    TASK:
      Generate a brief study report.
      1. Summary: Encouraging overview(1 - 2 sentences).
      2. Strategies: 3 specific mnemonic devices or study tricks for the missed terms.

      OUTPUT JSON:
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strategies: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "strategies"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    return {
      score: "", // Handled by frontend
      masteredTerms: [], // Handled by frontend
      missedTerms: missedTerms,
      summary: result.summary || "Good effort! Review the terms below to master this topic.",
      strategies: result.strategies || ["Review the flashcards again.", "Try writing the definitions out by hand."]
    };

  } catch (err) {
    console.error("Flashcard report failed", err);
    return {
      score: "",
      masteredTerms: [],
      missedTerms: missedTerms,
      summary: "Good practice session. Focus on the terms you missed.",
      strategies: ["Review these cards again to solidify your memory."]
    };
  }
};
