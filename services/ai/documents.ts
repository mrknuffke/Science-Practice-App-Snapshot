import { Type, type Part } from "@google/genai";
import { CourseType, Question, RubricData } from "../../types";
import { FileData } from "../fileData";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

/** How many of each question type a document quiz asks for (the matching fields of AppConfig). */
export interface QuizCounts {
  mcqCount?: number;
  saCount?: number;
  errorCount?: number;
  analogyCount?: number;
  oddOneOutCount?: number;
}

/**
 * GENERATE QUIZ FROM DOCUMENTS (RAG / CONTEXT AWARE)
 * Uses User provided text or files to generate questions.
 */
export const generateQuizFromDocuments = async (
  textContext: string,
  files: FileData[] = [],
  level: string = 'High School',
  config: QuizCounts
): Promise<Question[]> => {
  try {
    const mcqCount = config.mcqCount || 3;
    const saCount = config.saCount || 1;
    const errorCount = config.errorCount || 0;
    const analogyCount = config.analogyCount || 0;
    const oddOneOutCount = config.oddOneOutCount || 0;
    const totalCount = mcqCount + saCount + errorCount + analogyCount + oddOneOutCount;

    const prompt = `
      TASK:
      You are an expert teacher creating a quiz based STRICTLY on the provided study materials.

      TARGET AUDIENCE: ${level} Level Students.
      Adjust vocabulary, complexity, and conceptual depth to match this level perfectly.

      INPUT CONTEXT:
      The user has provided text notes and/or image/document files.

      INSTRUCTIONS:
      1. Analyze ALL provided text and files.
      2. Generate exactly ${totalCount} questions.
      3. CRITICAL: The questions must be derivable ONLY from the provided materials.
      4. QUESTION MIX:
         - ${mcqCount} Multiple Choice (mcq): For definition/recall.
         - ${saCount} Short Answer (sa): For concept application.
         - ${errorCount} Error Correction (error_correction): Present a statement with a mistake.
         - ${analogyCount} Analogies (sa, subType: analogy): "A is to B as C is to...".
         - ${oddOneOutCount} Odd One Out (mcq, subType: odd_one_out): Which option doesn't fit?
      5. SCAFFOLDING: Order the questions from Easiest (Define/Identify) to Hardest (Analyze/Synthesize).

      OUTPUT FORMAT:
      Return a JSON object with a "questions" array.
      - text: Question stem.
      - type: "mcq" | "sa" | "error_correction"
      - subType: "recall" | "concept" | "application" | "analogy" | "odd_one_out" | "error"
      - options: 4 distinct choices (for MCQ only). Empty array for SA/Error.
      - correctAnswer: The correct choice text (MCQ) or the model answer (SA/Error).
    `;

    // Construct the parts array correctly
    const promptPart = { text: prompt };
    const textPart = textContext ? { text: `User Notes:\n${textContext}` } : null;

    // File parts are already in the correct format { inlineData: ... }
    const parts = [
      promptPart,
      ...(textPart ? [textPart] : []),
      ...files
    ];

    const contents = { parts };

    const response = await callAI(DEFAULT_MODEL, contents, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["mcq", "sa", "error_correction"] },
                subType: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Required for MCQ, empty for others" },
                correctAnswer: { type: Type.STRING }
              },
              required: ["text", "type", "options", "correctAnswer"]
            }
          }
        },
        required: ["questions"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { questions?: Question[] } = JSON.parse(cleanText || "{\"questions\": []}");

    if (!result.questions || result.questions.length === 0) return [];

    return result.questions.map((q, i) => ({
      ...q,
      id: `doc-q-${i}-${Date.now()}`,
      unit: "Document Analysis",
      topic: "My Notes",
      // type is already in q
    }));

  } catch (err) {
    console.error("Quiz Gen Error:", err);
    return [];
  }
};

/**
 * GENERATE CALCULATION PROBLEM SET
 * Generates math-heavy science problems (Stoichiometry, Physics, etc.)
 */
export const generateCalculationProblems = async (
  course: CourseType,
  topic: string,
  count: number = 5,
  difficulty: string = 'Medium',
  sequencing: 'Massed' | 'Interleaved' | 'Increasing' = 'Massed'
): Promise<Question[]> => {
  try {
    const _ctx = getCourseContext(course);

    let sequenceInstruction = "";
    if (sequencing === 'Massed') {
      sequenceInstruction = "SEQUENCING: Massed Practice. Group problems by specific sub-skill or formula type (e.g., all density problems, then all conversion problems).";
    } else if (sequencing === 'Interleaved') {
      sequenceInstruction = "SEQUENCING: Interleaved Practice. Randomly mix different types of problems/formulas to prevent pattern matching. Do not group similar problems.";
    } else if (sequencing === 'Increasing') {
      sequenceInstruction = "SEQUENCING: Increasing Difficulty. Problem 1 should be the simplest foundation. The last problem should be the complex multidimensional application.";
    }

    const prompt = `
      TASK:
      Generate ${count} calculation-heavy practice problems for ${course} students.
      TOPIC: ${topic}
      DIFFICULTY: ${difficulty}
      ${sequenceInstruction}

      REQUIREMENTS:
      1. PROBLEMS: Must require significant mathematical steps (formulas, algebra, unit conversion).
      2. CONTEXT: Real-world science scenarios relevant to the topic.
      3. VARIETY: Mix of single-step and multi-step problems (if not strictly defined by sequencing).
      4. FORMAT:
         - Provide the question text.
         - Provide the final numerical answer (with units) as the 'correctAnswer'.
         - (Optional) Provide a step-by-step solution path in the 'scenario' field for the answer key.

      OUTPUT JSON:
      {
        "questions": [
          {
            "text": "Calculate the molarity...",
            "type": "sa",
            "correctAnswer": "0.5 M",
            "scenario": "Step 1: Moles = ... Step 2: Liters = ..."
          }
        ]
      }
    `;

    const response = await callAI(DEFAULT_MODEL, [{ role: 'user', parts: [{ text: prompt }] }], {
      responseMimeType: "application/json"
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { questions?: Question[] } = JSON.parse(cleanText || "{\"questions\": []}");

    if (!result.questions || result.questions.length === 0) return [];

    return result.questions.map((q, i) => ({
      ...q,
      id: `calc-${i}-${Date.now()}`,
      unit: topic,
      topic: topic,
      type: 'sa', // Default to Short Answer for calculations
      subType: 'calculation'
    }));

  } catch (err) {
    console.error("Calculation Gen Error:", err);
    return [];
  }
};

// --- SMART SCANNER: NOTE SHEET GENERATION ---
export const generateNoteSheet = async (textContext: string, files: FileData[], level: string = 'High School'): Promise<string> => {
  const prompt = `
      ROLE: Expert Academic Tutor and Study Guide Creator.
      TARGET AUDIENCE: ${level} Level Students.
      GOAL: Create a highly structured, visually clear "Active Note Sheet" from the provided documents, tailored to the target audience's reading level.

      INSTRUCTIONS:
      1. Analyze ALL provided text and files deeply.
      2. RESTRUCTURE the content into a clear hierarchy. Do not just summarize linearly; organize by concept.
      3. FORMATTING RULES (STRICT MARKDOWN):
         - Use # H1 for the Main Topic.
         - Use ## H2 for Major Concepts.
         - Use ### H3 for Sub-concepts.
         - Use **Bold** for ALL key terms and definitions.
         - Use bullet points for lists (do not use long paragraphs).
      4. ACTIVE LEARNING:
         - Every 2-3 major sections, insert a "🧠 Check Your Understanding" box with 1-2 retrieval questions.
         - Keep these questions separate from the main text.
      5. TONE: clear, concise, and study-ready.

      OUTPUT:
      Return ONLY the raw Markdown string.
    `;

  const promptPart = { text: prompt };
  const textPart = textContext ? { text: `User Notes:\n${textContext}` } : null;

  const parts = [
    promptPart,
    ...(textPart ? [textPart] : []),
    ...files
  ];

  const contents = { parts };

  const response = await callAI(DEFAULT_MODEL, contents, {});
  let text = response.text || "Could not generate note sheet.";

  // Clean up potential markdown code blocks
  text = text.replace(/^```markdown\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '');

  return text;
};

export const translateRubric = async (
  rubricText: string
): Promise<RubricData> => {
  try {
    const prompt = `
      You are an expert educational consultant.
      TASK: Analyze the following official rubric text and convert it into student-friendly tools.

      RUBRIC TEXT:
      "${rubricText}"

      REQUIREMENTS:
      1. Success Criteria: Extract key requirements and convert them into a simple, actionable checklist (e.g., "I have included...").
      2. Student Friendly: Rewrite the core standards in simple, encouraging language (6th-8th grade reading level).

      OUTPUT JSON:
      {
        "successCriteria": ["Item 1", "Item 2"...],
        "studentFriendly": "Summary paragraph..."
      }
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          successCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
          studentFriendly: { type: Type.STRING }
        },
        required: ["successCriteria", "studentFriendly"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    return JSON.parse(cleanText || "{}");

  } catch (err) {
    console.error("Rubric translation failed:", err);
    throw new Error("Could not translate rubric.");
  }
};

// --- ASSESSMENT INTERVIEW SCRIPT ---

export const getInterviewQuestions = async (
  topic: string,
  files: FileData[] = []
): Promise<string[]> => {
  try {
    const prompt = `
      ROLE: Educational Assessment Specialist.
      TASK: Generate 5-7 distinct interview questions to assess a student's understanding of "${topic}".

      CONTEXT:
      ${files.length > 0 ? "The user has provided reference material. tailor questions to this content." : "Questions should be based on standard curriculum for this topic."}

      REQUIREMENTS:
      1. Progressive Difficulty: Start with recall/definition, move to application, then synthesis/analysis.
      2. Open-Ended: Avoid "Yes/No" questions. Encourages explanation.
      3. Clarity: Questions should be clear and conducive to verbal answers.

      OUTPUT:
      Return a simple JSON array of strings.
    `;

    const parts: Part[] = [{ text: prompt }];
    files.forEach(f => parts.push(f));

    const response = await callAI(DEFAULT_MODEL, { parts }, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["questions"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{\"questions\": []}");
    return result.questions;

  } catch (err) {
    console.error("Interview questions failed:", err);
    return [
      "Explain the main concept in your own words.",
      "Can you give a real-world example of this?",
      "How does this relate to what we learned previously?"
    ];
  }
};

export const getRubricForQuestions = async (
  topic: string,
  questions: string[]
): Promise<string> => {
  try {
    const prompt = `
      ROLE: Educational Assessment Specialist.
      TASK: Create a grading rubric (Look-fors) for a verbal assessment interview.
      TOPIC: ${topic}

      QUESTIONS BEING ASKED:
      ${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

      REQUIREMENTS:
      1. Create a "Success Criteria" checklist.
      2. Create a "Student Friendly" summary.
      3. OUTPUT FORMAT: Markdown.
         - Use checkbox syntax for success criteria (e.g. - [ ] Mentioned...)
         - Use > for the student friendly summary.

      OUTPUT:
      Markdown string.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {});

    const cleanText = cleanJsonResponse(response.text || "");
    return cleanText || "Could not generate rubric.";

  } catch (err) {
    console.error("Rubric generation failed:", err);
    return `
### Success Criteria
- [ ] Student defines the core concept accurately.
- [ ] Student provides a relevant example.

> **Student Goal:** Explain what you know clearly!
    `;
  }
};

// --- REFLECTION / METACOGNITION PROMPTER ---

export type ReflectionStructure =
  | 'learning_journal'
  | 'exit_ticket'
  | 'i_used_to_think'
  | '321'
  | 'plus_delta'
  | 'scientific_metacognition';

export interface ReflectionPrompt {
  title: string;
  subtitle: string;
  prompts: { question: string; sentenceStarter?: string }[];
  sentenceFrames?: string[];
  teacherDebriefNote: string;
}

export const getReflectionPrompts = async (
  topic: string,
  structure: ReflectionStructure,
  gradeLevel: string = 'High School',
  course: string = ''
): Promise<ReflectionPrompt> => {
  const structureDescriptions: Record<ReflectionStructure, string> = {
    'learning_journal': 'Learning Journal Entry — Open reflection on what was learned, what was challenging, and what the student wants to explore further.',
    'exit_ticket': 'Exit Ticket Metacognition — Muddiest point, most important takeaway, and a self-confidence rating.',
    'i_used_to_think': "I Used to Think / Now I Think — Track how a student's understanding of a concept has changed through exploration.",
    '321': '3-2-1 Reflection — 3 things learned, 2 questions they still have, 1 real-world connection.',
    'plus_delta': 'Plus/Delta — What worked well in their learning (Plus) and what they would change or do differently (Delta).',
    'scientific_metacognition': 'Scientific Metacognition — Science-specific reflection: What surprised them, what they would test differently, how evidence shaped their thinking.'
  };

  const prompt = `
    ROLE: Expert educational coach specializing in metacognition and reflective practice.
    TASK: Create a scaffolded student-facing metacognitive reflection prompt sheet.

    TOPIC: ${topic}
    COURSE/SUBJECT: ${course || 'Science'}
    GRADE LEVEL: ${gradeLevel}
    REFLECTION STRUCTURE: ${structureDescriptions[structure]}

    REQUIREMENTS:
    1. TITLE: A student-friendly title for this reflection activity.
    2. SUBTITLE: A brief one-sentence explanation of why this type of reflection is valuable.
    3. PROMPTS: Generate 4-6 scaffolded prompts appropriate for this structure.
       - Each prompt should be open-ended (avoid yes/no), specific to the given topic, and age-appropriate.
       - For each prompt, include an optional sentence starter that helps students begin their response.
    4. SENTENCE FRAMES: Provide 2-3 sentence frame templates for ELL students or those who need extra support.
    5. TEACHER DEBRIEF NOTE: A brief suggestion for how the teacher can use these reflections to inform their next lesson.

    TONE: Warm, encouraging, and age-appropriate. Avoid jargon.

    OUTPUT JSON with fields: title (string), subtitle (string), prompts (array of {question, sentenceStarter}), sentenceFrames (array of strings), teacherDebriefNote (string).
  `;

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          prompts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                sentenceStarter: { type: Type.STRING }
              },
              required: ['question']
            }
          },
          sentenceFrames: { type: Type.ARRAY, items: { type: Type.STRING } },
          teacherDebriefNote: { type: Type.STRING }
        },
        required: ['title', 'subtitle', 'prompts', 'teacherDebriefNote']
      }
    });

    const cleanText = cleanJsonResponse(response.text || '{}');
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('Reflection prompts generation failed:', err);
    throw new Error('Could not generate reflection prompts. Please try again.');
  }
};
