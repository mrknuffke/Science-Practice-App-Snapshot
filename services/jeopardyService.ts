
import { Type } from "@google/genai";
import { JeopardyBoardData, JeopardyQuestion, JeopardyCategory, FinalJeopardy, PracticeProblem } from "../components/jeopardy/types";
import { callAI, cleanJsonResponse, DEFAULT_MODEL, VISION_MODEL } from "./ai/core";

const CLEVER_INSTRUCTIONS = `
- **CRITICAL: WHOLE COURSE CLEVER REVIEW GAME MODE PROMPT & FORMATTING**:
  - The board is a comprehensive, full-curriculum review for the course.
  - You MUST design clever, witty, and double-meaning categories in the style of the TV show Jeopardy!
  - Category titles should be highly engaging puns, wordplay, or cultural references related to the science concepts.
  - **CLASSIC JEOPARDY CATEGORY MODELS & THEMATIC CONSTRAINTS**:
    - Draw inspiration from these classic formats:
      1. *Before & After (Word Smushing)*: Merging two scientific terms sharing a common middle word (e.g., active transport + transport protein + protein soda = "Active Transport Protein Soda").
      2. *Scientific Rhyme Time*: Clues leading to rhyming multi-word answers (e.g., Clue: "A structural cell barrier that takes a tumble" -> Answer: "Cell Wall Fall").
      3. *Science 'A' to 'Z' (Letter Constrained / Common Word Part)*: Categories where every answer or clue adheres to a letter constraint or shares a word part (e.g., "Contains 'Cell'", "Starts with E", "Ending in -ology").
      4. *Double Entendres & Puns*: Exploiting everyday terms with scientific meanings (e.g., "Going Through a Phase", "Split Decisions", "Acid Remarks").
      5. *Property Comparisons*: Comparing two terms in terms of a property (e.g., Clue: "Of Fluorine and Francium, the one with the higher electronegativity" -> Answer: "Fluorine").

  - **CRITICAL FOR CLUES: THE CLUES THEMSELVES MUST BE CLEVER AND WITTY**:
    - **DO NOT** write dry, plain, textbook-style definitions or standard question sentences (like "Which organelle does cellular respiration?"). That is completely unacceptable and a failure.
    - **DO** frame every single clue as a genuine, witty Jeopardy! riddle. Use subtle wordplay, alliteration, metaphors, secondary meanings, or puns inside the text of the clue itself.
    - **DO** embed helpful secondary hints or trivia inside the clue that guide the user to the answer.
    
  - **CONCRETE EXAMPLES OF DRY VS. JEOPARDY-STYLE CLEVER CLUES**:
    1. Category: *Before & After*
       - DRY CLUE: What is the organelle that synthesizes protein and the element with atomic symbol C? (Answer: Ribosome Carbon)
       - CLEVER CLUE: This protein-building workhorse of the cell smushes its name with the element whose allotropes include diamond and coal. (Answer: Ribosome Carbon)
    2. Category: *Scientific Rhyme Time*
       - DRY CLUE: What is a green organelle that is not clean? (Answer: Plastid Nasty)
       - CLEVER CLUE: A cellular site of photosynthesis that is also an incredibly untidy or dirty place. (Answer: Plastid Nasty)
    3. Category: *Double Entendres & Puns*
       - DRY CLUE: What are the phases of matter? (Answer: Phases)
       - CLEVER CLUE: Whether you're a moody teenager or a sample of water transitioning from solid to liquid, you're definitely going through one of these. (Answer: Phases)
       - DRY CLUE: What happens during cell division? (Answer: Split Decisions)
       - CLEVER CLUE: It's what the cell nucleus had to make when it couldn't decide whether to divide its assets or stay single. (Answer: Split Decisions)
    4. Category: *Science A to Z*
       - DRY CLUE: What is the organelle that produces ATP? (Answer: Mitochondrion)
       - CLEVER CLUE: Let's start with 'M' for this double-membraned powerhouse that keeps cellular engines running by churning out ATP. (Answer: Mitochondrion)
    5. Category: *Property Comparisons*
       - DRY CLUE: Which has higher electronegativity, Fluorine or Francium? (Answer: Fluorine)
       - CLEVER CLUE: Between the greediness of Fluorine and the generous nature of Francium, this electron-hogging halogen wins the highest electronegativity prize. (Answer: Fluorine)
`;

const getSystemInstruction = (classicMode: boolean, isWholeCourse: boolean = false) => `You are a Scientific Education Architect. 
Your task is to generate rigorous, high-quality Science Jeopardy content.
IMPORTANT RULES: 
- Use standard scientific notation. Use HTML <sub> and <sup> tags for formulas.
- Clues should be scientifically accurate for the requested grade level. AP/College level must be rigorous and challenging. Middle School should be accessible but precise.
- ${isWholeCourse 
    ? (classicMode 
        ? "Classic Mode: Format the clue as a witty statement/riddle and the answer as a question (e.g. Clue: 'This double-membraned powerhouse keeps cellular engines running by churning out ATP', Answer: 'What is the Mitochondria?')."
        : "Standard Mode (Default): Format the clue as a witty riddle-style question. The answer must be a direct statement, NOT a question (e.g. Clue: 'Which double-membraned powerhouse keeps cellular engines running by churning out ATP?', Answer: 'The Mitochondria')."
      )
    : (classicMode
        ? "Classic Mode: Format the clue as a statement and the answer as a question (e.g. Clue: 'This organelle is the powerhouse', Answer: 'What is the Mitochondria?')."
        : "Standard Mode (Default): Format the clue as a direct question. The answer must be a direct statement, NOT a question (e.g. Clue: 'Which organelle is the powerhouse?', Answer: 'The Mitochondria')."
      )
  }
- For topics involving data, trends, or analysis, you MUST include a 'chartData' array.
  - Use 'area' for filled distributions (e.g., bell curves, Before/After selection).
  - Use 'line' for trends over time (e.g., genetic drift, reaction rates).
  - Use 'bar' for categorical comparisons.
  - Use 'scatter' for correlations.
  - Use 'error' key for error bars where appropriate.
- Include 'xAxisLabel' and 'yAxisLabel'.
- For comparisons (Before vs After), use 'valueBefore' and 'valueAfter' keys on the SAME item. Do NOT create separate items for Before/After timepoints.
- Ensure generated chart data has CLEAR VISUAL DIFFERENCES to support the question. Avoid flat lines unless required.
- Final Jeopardy must be significantly more difficult than the rest of the board.
- Format EVERY chemical equation, mathematical formula, or variable definition on its own new line using <br> tags for readability.
- Be concise in the questions and answers.

- STRICT DIFFICULTY TIER RUBRIC (Ramp difficulty systematically from $200 to $1000):
  - **$200 (Basic Terminology & Direct Recall)**: Focus on direct recall of a fundamental definition, symbol, or term. Low cognitive complexity. Humorous/clever clue, but extremely simple to answer.
  - **$400 (Conceptual Understanding & Application)**: State a simple law, explain the basic function of a molecule/structure, or apply a basic concept in a standard scenario.
  - **$600 (Process Analysis & Qualitative Dynamics)**: Explain/trace sequential steps in a biochemical pathway or physical process, connect two related concepts, or predict the direct qualitative effect of a standard change.
  - **$800 (System Perturbations & Intermediate Calculations)**: Predict biological/chemical/physical outcomes when a complex system is mutated, blocked, or altered (e.g. gene mutations, enzyme inhibition), or solve a single-stage mathematical equation.
  - **$1000 (Advanced Synthesis, Experimental Interpretation, & Quantitative Mastery)**: College/AP-level rigor. Analyze complex experimental setups (e.g. interpret standard error bars, graphs, gel electrophoresis) or solve a rigorous multi-step quantitative calculation.

${isWholeCourse ? `\n- WHOLE COURSE REVIEW GAME MODE: ${CLEVER_INSTRUCTIONS}` : ""}`;

const QUESTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        value: { type: Type.INTEGER },
        question: { type: Type.STRING, description: "The clue text" },
        answer: { type: Type.STRING, description: "The correct answer" },
        hint: { type: Type.STRING, description: "A helpful hint" },
        xAxisLabel: { type: Type.STRING },
        yAxisLabel: { type: Type.STRING },
        chartType: { type: Type.STRING, enum: ["line", "area", "bar", "scatter"] },
        chartData: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                description: "Chart point containing a required 'label' (string), and optional 'value' (number), 'value2' (number), 'valueBefore' (number), 'valueAfter' (number), 'error' (number)."
            }
        },
        tableData: {
            type: Type.OBJECT,
            description: "Table data containing 'headers' (array of strings) and 'rows' (array of array of strings)."
        }
    },
    required: ["id", "value", "question", "answer", "hint"]
};

const CANONICAL_VALUES = [200, 400, 600, 800, 1000] as const;

/** A category as the model returned it: any field may be missing or the wrong type. */
interface RawCategory {
    title?: unknown;
    questions?: unknown;
}
type RawClue = Partial<Record<keyof JeopardyQuestion, unknown>>;

const normalizeCategory = (cat: RawCategory | null | undefined, catIndex: number): JeopardyCategory => {
    const title = typeof cat?.title === 'string' && cat.title.trim() ? cat.title : `Category ${catIndex + 1}`;
    const incoming: RawClue[] = Array.isArray(cat?.questions) ? cat.questions : [];
    const sorted = [...incoming].sort((a, b) => (Number(a?.value) || 0) - (Number(b?.value) || 0));
    const questions: JeopardyQuestion[] = CANONICAL_VALUES.map((value, i) => {
        const src = sorted[i];
        if (src && typeof src.question === 'string' && typeof src.answer === 'string') {
            return {
                ...src,
                value,
                id: typeof src.id === 'string' && src.id ? src.id : `cat${catIndex}-v${value}`,
                hint: typeof src.hint === 'string' ? src.hint : '',
            } as JeopardyQuestion;
        }
        return {
            id: `cat${catIndex}-v${value}-placeholder`,
            value,
            question: 'Clue unavailable — please use Refresh to regenerate this question.',
            answer: '—',
            hint: 'Regenerate this clue from the pre-game review screen.',
        };
    });
    return { title, questions };
};

export const generateJeopardyBoard = async (
    topic: string,
    gradeLevel: string = "High School",
    standards: string = "",
    classicMode: boolean = false,
    _sourceContext: string = "",
    categorySpecs: { title: string; focus?: string }[] = [],
    _difficultyMode: 'random' | 'increasing' = 'random',
    isWholeCourse: boolean = false
): Promise<JeopardyBoardData> => {
    const model = DEFAULT_MODEL;
    const isClever = isWholeCourse;

    // --- STAGE 1: Determine Categories and Final Jeopardy ---
    let categoriesList: { title: string; focus?: string }[] = [];
    let finalJeopardy: FinalJeopardy;

    if (categorySpecs.length >= 5) {
        // Optimization: Use pre-specified category titles/focuses
        categoriesList = categorySpecs.slice(0, 5);
        
        // Generate only Final Jeopardy
        const finalJContents = `Generate a challenging Final Jeopardy question for the topic: "${topic}" (${gradeLevel}). Subtopics/Units: ${standards}.`;
        const finalJConfig = {
            systemInstruction: getSystemInstruction(classicMode, isWholeCourse),
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    category: { type: Type.STRING },
                    clue: { type: Type.STRING },
                    answer: { type: Type.STRING }
                },
                required: ["category", "clue", "answer"]
            }
        };
        const finalJResponse = await callAI(model, finalJContents, finalJConfig);
        finalJeopardy = JSON.parse(cleanJsonResponse(finalJResponse.text || '{}'));
    } else {
        // Stage 1 AI Call: Establish the 5 categories and the Final Jeopardy clue
        const stage1SystemInstruction = `You are a Scientific Education Architect.
Your task is to establish the category titles and Final Jeopardy for a high-quality Science Jeopardy review board on the topic: "${topic}" (${gradeLevel}). Subtopics/Units: ${standards}.
${isClever ? `
- Design 5 highly engaging, clever, witty, and double-meaning categories in the style of the TV show Jeopardy!
- Category titles should be puns, wordplay, or cultural references related to the science concepts.
- The 5 categories must collectively cover the entire scope of the course curriculum (e.g. from early units to late units of the syllabus).
- For each category, provide a brief 'focus' describing which unit or core concepts it covers (e.g., 'focus': 'Cell division and mitosis').
- Choose classic Jeopardy categories: Before & After, Rhyme Time, Double Entendres & Puns, Property Comparisons, or Letter-constrained categories.
` : `
- Design 5 distinct categories covering the key units/subtopics of "${topic}" (${gradeLevel}).
- For each category, provide a brief 'focus' describing which specific aspects of the topic it covers.
`}
- Also design a challenging Final Jeopardy category, clue, and answer that requires conceptual synthesis.
- Ensure the output fits the requested schema exactly.`;

        const stage1Contents = isClever
            ? `Establish the themes, clever categories, and Final Jeopardy for a comprehensive WHOLE COURSE review of the topic: "${topic}" (${gradeLevel}). Subtopics/Units: ${standards}.
            You MUST design 5 highly engaging, clever, witty, and double-meaning categories in the style of the TV show Jeopardy!.
            Category titles should be puns, wordplay, or cultural references.
            The 5 categories must collectively cover the entire scope of the course curriculum.
            Also design a highly challenging Final Jeopardy category, clue, and answer.`
            : `Establish the category titles and Final Jeopardy for a Science Jeopardy review board on the topic: "${topic}" (${gradeLevel}). Subtopics/Units: ${standards}.
            Design 5 distinct categories.
            Also design a challenging Final Jeopardy category, clue, and answer.`;

        const stage1Config = {
            systemInstruction: stage1SystemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    categories: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                focus: { type: Type.STRING, description: "Specific subtopic or unit from the curriculum for this category" }
                            },
                            required: ["title"]
                        }
                    },
                    finalJeopardy: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            clue: { type: Type.STRING },
                            answer: { type: Type.STRING }
                        },
                        required: ["category", "clue", "answer"]
                    }
                },
                required: ["categories", "finalJeopardy"]
            }
        };

        const stage1Response = await callAI(model, stage1Contents, stage1Config);
        const stage1Parsed = JSON.parse(cleanJsonResponse(stage1Response.text || '{}'));
        
        categoriesList = Array.isArray(stage1Parsed.categories) ? stage1Parsed.categories : [];
        while (categoriesList.length < 5) {
            categoriesList.push({ title: `Category ${categoriesList.length + 1}`, focus: "" });
        }
        categoriesList = categoriesList.slice(0, 5);

        finalJeopardy = stage1Parsed.finalJeopardy || {
            category: "Science",
            clue: "This is a placeholder Final Jeopardy clue.",
            answer: "Placeholder Answer"
        };
    }

    // --- STAGE 2: Generate Category Clues in Parallel ---
    const categoryPromises = categoriesList.map(async (cat, _i) => {
        try {
            return await refreshCategory(
                topic,
                cat.title,
                gradeLevel,
                "", // teacherNotes
                classicMode,
                cat.title, // newTitleOverride
                isWholeCourse,
                cat.focus || "" // categoryFocus
            );
        } catch (error) {
            console.error(`Failed to generate category "${cat.title}"`, error);
            // Return placeholder-ready structure to normalizeBoard later
            return {
                title: cat.title,
                questions: []
            };
        }
    });

    const categories = await Promise.all(categoryPromises);

    const rawBoard = {
        categories: categories.map((cat, i) => normalizeCategory(cat, i)),
        finalJeopardy
    };

    const allIds: string[] = [];
    if (rawBoard.categories) {
        rawBoard.categories.forEach((cat: JeopardyCategory) => cat.questions.forEach((q) => allIds.push(q.id)));
    }
    const dailyDoubleIds = allIds.sort(() => 0.5 - Math.random()).slice(0, 2);

    return { ...rawBoard, dailyDoubleIds };
};

export const refreshSingleQuestion = async (
    topic: string,
    category: string,
    value: number,
    _gradeLevel: string = "High School",
    teacherNotes: string = "",
    classicMode: boolean = false,
    previousNotes: string[] = [],
    isWholeCourse: boolean = false
): Promise<JeopardyQuestion> => {
    const model = DEFAULT_MODEL;

    // Build context from previous notes
    const contextPrompt = previousNotes.length > 0
        ? ` PREVIOUS REFINEMENT CONTEXT (keep these constraints in mind): ${previousNotes.map((n, i) => `[${i + 1}] "${n}"`).join('; ')}.`
        : "";
    const notesPrompt = teacherNotes ? ` SPECIAL TEACHER INSTRUCTIONS: "${teacherNotes}" (Ensure strict adherence).` : "";
    const cleverPrompt = isWholeCourse 
        ? `\n\nNote: This is part of a WHOLE COURSE review. The category "${category}" is meant to be highly clever and witty.
${CLEVER_INSTRUCTIONS}
**CRITICAL: The clue text itself MUST be clever, use wordplay, or lean heavily into the thematic gimmick of the category title.** Ensure this $${value} clue strictly fits a difficulty level of $${value} (where $200 is very basic and $1000 is extremely challenging synthesis/calculation).`
        : "";
    const contents = `Regenerate a science clue for topic "${topic}" in category "${category}" at $${value}.${contextPrompt}${notesPrompt}${cleverPrompt}`;

    // Dynamic Schema Enforcement
    const allNotes = [...previousNotes, teacherNotes].join(' ');
    const wantsGraph = /graph|chart|plot|curve/i.test(allNotes);
    const wantsTable = /table|data|row|column/i.test(allNotes);

    const dynamicSchema = JSON.parse(JSON.stringify(QUESTION_SCHEMA)); // Deep clone
    if (wantsGraph) {
        dynamicSchema.required.push("chartData");
    } else if (wantsTable) {
        dynamicSchema.required.push("tableData");
    }

    const config = {
        systemInstruction: getSystemInstruction(classicMode, isWholeCourse) + (wantsGraph ? " YOU MUST INCLUDE chartData." : "") + (wantsTable ? " YOU MUST INCLUDE tableData." : ""),
        responseMimeType: "application/json",
        responseSchema: dynamicSchema
    };

    const response = await callAI(model, contents, config);
    return JSON.parse(cleanJsonResponse(response.text || '{}'));
};

export const refreshCategory = async (
    topic: string,
    categoryTitle: string,
    gradeLevel: string = "High School",
    teacherNotes: string = "",
    classicMode: boolean = false,
    newTitleOverride: string = "",
    isWholeCourse: boolean = false,
    categoryFocus: string = ""
): Promise<JeopardyCategory> => {
    const model = DEFAULT_MODEL;
    const titleDirective = newTitleOverride.trim()
        ? ` The NEW category title MUST be exactly "${newTitleOverride.trim()}". Rewrite all 5 questions to fit this new title.`
        : "";
    const focusPrompt = categoryFocus.trim()
        ? ` The questions in this category MUST focus specifically on this curriculum focus/subtopic: "${categoryFocus.trim()}".`
        : "";
    const cleverPrompt = isWholeCourse 
        ? `\n\nNote: This is part of a WHOLE COURSE review. The category title "${newTitleOverride || categoryTitle}" must remain highly clever and witty.
${CLEVER_INSTRUCTIONS}
**CRITICAL: The clues themselves MUST also be clever, incorporate wordplay, or fit the theme of the category.** The 5 questions must strictly ramp in difficulty from $200 (basic definition/concept) to $1000 (AP-level synthesis/rigor/calculation).`
        : "";
    const contents = `Regenerate category "${categoryTitle}" for topic "${topic}" at ${gradeLevel}. Generate exactly 5 questions (one for each value: $200, $400, $600, $800, $1000).${titleDirective}${focusPrompt} ${teacherNotes}${cleverPrompt}`;

    // Dynamic Schema Enforcement for Category
    const wantsGraph = /graph|chart|plot|curve/i.test(teacherNotes);
    const wantsTable = /table|data|row|column/i.test(teacherNotes);

    const itemSchema = JSON.parse(JSON.stringify(QUESTION_SCHEMA));
    if (wantsGraph) {
        itemSchema.required.push("chartData");
    } else if (wantsTable) {
        itemSchema.required.push("tableData");
    }

    const config = {
        systemInstruction: getSystemInstruction(classicMode, isWholeCourse) + (wantsGraph ? " ALL QUESTIONS MUST INCLUDE chartData." : "") + (wantsTable ? " ALL QUESTIONS MUST INCLUDE tableData." : ""),
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                questions: {
                    type: Type.ARRAY,
                    items: itemSchema
                }
            },
            required: ["title", "questions"]
        }
    };

    const response = await callAI(model, contents, config);
    const parsed = JSON.parse(cleanJsonResponse(response.text || '{}'));
    return normalizeCategory(parsed, 0);
};

export const refreshFinalJeopardy = async (
    topic: string,
    currentFinal: FinalJeopardy,
    gradeLevel: string = "High School",
    teacherNotes: string = "",
    classicMode: boolean = false,
    newCategoryOverride: string = "",
    isWholeCourse: boolean = false
): Promise<FinalJeopardy> => {
    const model = DEFAULT_MODEL;
    const categoryDirective = newCategoryOverride.trim()
        ? ` The NEW Final Jeopardy category MUST be exactly "${newCategoryOverride.trim()}".`
        : ` Keep the category "${currentFinal.category}" unless the teacher instructions request otherwise.`;
    const cleverPrompt = isWholeCourse 
        ? `\n\nNote: This is part of a WHOLE COURSE review. Keep the Final Jeopardy category highly clever and witty.
${CLEVER_INSTRUCTIONS}
**CRITICAL: The clue itself MUST be clever, engaging, and use wordplay or thematic language.** Ensure the clue is extremely difficult and requires comprehensive synthesis of course concepts.`
        : "";
    const contents = `Regenerate the Final Jeopardy clue for topic "${topic}" at ${gradeLevel}.${categoryDirective}
CURRENT CLUE: "${currentFinal.clue}"
CURRENT ANSWER: "${currentFinal.answer}"
Final Jeopardy must be significantly more difficult than the rest of the board.
TEACHER INSTRUCTIONS: ${teacherNotes || "(none — rewrite with fresh angle while respecting the above constraints)"}${cleverPrompt}`;

    const config = {
        systemInstruction: getSystemInstruction(classicMode, isWholeCourse),
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                clue: { type: Type.STRING },
                answer: { type: Type.STRING }
            },
            required: ["category", "clue", "answer"]
        }
    };

    const response = await callAI(model, contents, config);
    return JSON.parse(cleanJsonResponse(response.text || '{}'));
};

export const getAnswerForCustomQuestion = async (question: string, topic: string): Promise<{ answer: string; hint: string }> => {
    const model = DEFAULT_MODEL;
    const contents = `Topic: ${topic}. For the clue: "${question}", provide a correct scientific answer and a helpful hint.`;

    const config = {
        systemInstruction: "Scientific Expert. Provide direct answer and hint.",
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: { answer: { type: Type.STRING }, hint: { type: Type.STRING } },
            required: ["answer", "hint"]
        }
    };

    const response = await callAI(model, contents, config);
    return JSON.parse(cleanJsonResponse(response.text || '{"answer": "", "hint": ""}'));
};

export const analyzeImage = async (base64: string, mimeType: string): Promise<string> => {
    // Vision model — deliberately pinned, not DEFAULT_MODEL
    const model = VISION_MODEL;
    // Logic adapted from geminiService: pass image in contents object parts
    const contents = {
        role: 'user',
        parts: [
            {
                inlineData: {
                    data: base64,
                    mimeType: mimeType
                }
            },
            {
                text: "Analyze this scientific image (e.g., textbook problem, lab setup, or diagram). Provide a detailed explanation of the concepts shown, solve any problems presented, and use HTML <sub> and <sup> tags for any chemical or mathematical formulas."
            }
        ]
    };

    const response = await callAI(model, contents, {});
    return response.text || "";
};

export const generatePracticeProblems = async (topic: string): Promise<PracticeProblem[]> => {
    const model = DEFAULT_MODEL;
    const contents = `Generate 5 high-quality, scientifically accurate practice problems for the topic: "${topic}".`;

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    question: { type: Type.STRING },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Four plausible options for the multiple choice question"
                    },
                    correctAnswer: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the options array" },
                    explanation: { type: Type.STRING, description: "A detailed scientific explanation of the correct answer" }
                },
                required: ["topic", "question", "options", "correctAnswer", "explanation"]
            }
        }
    };

    const response = await callAI(model, contents, config);
    return JSON.parse(cleanJsonResponse(response.text || "[]"));
};
// --- Study Tips Generation ---
export const generateStudyTips = async (topic: string, categories: string[]): Promise<string[]> => {
    try {
        const prompt = `
        Generate 5 high-impact, easy-to-remember study tips or key takeaways for a student reviewing the topic: "${topic}".
        Specifically address these sub-categories: ${categories.join(", ")}.
        
        Rules:
        - Keep each tip concise (1-2 sentences).
        - Focus on common misconceptions or memory aids (mnemonics).
        - Return a JSON array of strings.
        - Example: ["Remember: Oxidization Is Loss, Reduction Is Gain (OIL RIG).", "Mitochondria requires Oxygen to produce efficient ATP."]
        `;

        const result = await callAI(DEFAULT_MODEL, prompt, { responseMimeType: "application/json" });
        const cleaned = cleanJsonResponse(result.text || "[]");
        const json = JSON.parse(cleaned);
        return Array.isArray(json) ? json : [];
    } catch (e) {
        console.error("Failed to generate study tips", e);
        return [`Review the categories: ${categories.join(", ")}`, "Focus on the equations and definitions provided."];
    }
};
