import type { Part } from "@google/genai";
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from './core';
import { CourseEntry } from '../../constants/apCourses';
import { loadCedData, buildCedBlock } from '../../utils/cedLoader';
import {
  AP_PREP_ACTIVE_LEARNING_RULES,
  INTERACTION_MODES_INTRO,
  OFF_TOPIC_RULES,
  PEDAGOGY_ADAPTATIONS,
  CONTEXTUAL_METADATA_INSTRUCTION,
  PRE_EXAM_WELLNESS_PROMPT_SESSION_1,
  PRE_EXAM_WELLNESS_PROMPT_SESSION_2_PLUS,
} from '../../constants/activeLearning';

export const FORMATTING_RULES = `FORMATTING RULES — MANDATORY:
- NEVER use LaTeX (dollar signs $, $$, or backslash-escaped symbols like \\chi, \\alpha, \\frac). Use unicode directly: χ², α, β, Δ, μ, ≤, ≥, →, ∑, ×, ÷, π, σ, λ.
- Do NOT include raw backslashes in any JSON string value — they will break JSON parsing.
- For fractions, write inline: (observed − expected)² / expected, not \\frac{...}{...}.
- SCIENTIFIC TYPOGRAPHY: Wrap the following in markdown italics using single asterisks so they render in italics:
  * Binomial scientific names (genus + species): *Enhydra lutris*, *Homo sapiens*, *Escherichia coli*
  * Gene symbols: *BRCA1*, *TP53*, *lacZ*
  * Virus names when conventionally italicized in scientific literature
  * Foreign-language terms used in their original form (e.g., *in vivo*, *in vitro*, *a priori*)
  * Titles of published works (books, long-form journal/paper titles)
  Do NOT italicize common names (e.g., "sea otter" stays plain). Do NOT italicize chemical formulas or element symbols.`;

export const STIMULUS_RULES = `STIMULUS RULES — MANDATORY:
- Every stimulus MUST contain actual rendered content. ABSOLUTELY FORBIDDEN: "imagine a graph", "consider a table", "suppose you are given", or any placeholder language. Render the actual data or diagram inline.
- Use a markdown table with explicit data points for numerical/experimental data, or a \`\`\`mermaid xychart-beta block for trends and graphs.
- NEVER use Mermaid flowcharts or diagrams to attempt to depict physical objects, biological structures (like cells), or experimental apparatuses—they look horrendous and confuse students. If a visual is needed, describe the observations textually, or provide a markdown table of experimental results.
- The stimulus alone must provide all information needed to answer the question.`;

export const CED_SCOPE_RULES = `CED ALIGNMENT (CRITICAL):
- Before generating any content, verify that the requested unit/topic appears in the CED unit list provided. If it does not match exactly, generate content for the closest matching CED unit and note the substitution.
- Do NOT generate questions testing content outside the unit/topic scope listed in the CED data above.`;

/**
 * Builds the AP Tutor System Instructions
 */
export async function getApTutorSystemInstruction(
  entry: CourseEntry,
  examParam: string | null,
  preExamMode = false,
  preExamSession = 1
): Promise<string> {
  const sections: string[] = [];

  // 1. Role + CED scope
  let courseLabel = entry.displayName;
  if (entry.isPhysicsC) {
    courseLabel = examParam === 'em' ? 'AP Physics C: Electricity and Magnetism' : 'AP Physics C: Mechanics';
  } else if (entry.isCalcABBC) {
    courseLabel = examParam === 'bc' ? 'AP Calculus BC' : 'AP Calculus AB';
  }

  const isIB = entry.displayName.startsWith('IB ');
  const examLabel = isIB ? 'IB' : 'AP';
  const scopeLabel = isIB ? 'official IB Syllabus' : 'official College Board Course and Exam Description (CED)';

  sections.push(
    `You are an expert AI tutor for ${courseLabel}, acting as an active-learning study partner for students preparing for the ${examLabel} exam.\n\nYou are strictly scoped to the ${scopeLabel} for this course. Do not teach, assess, or reference content outside this scope.`
  );

  // 2. CED data block
  const cedData = await loadCedData(entry, examParam);
  if (cedData) {
    sections.push(buildCedBlock(cedData, entry));
  } else {
    sections.push(
      isIB
        ? `## COURSE SCOPE NOTE\nOfficial syllabus data for this course could not be loaded. Use your best knowledge of the IB ${entry.displayName} curriculum as published by the International Baccalaureate Organization, and stay within typical IB exam scope.`
        : `## COURSE SCOPE NOTE\nOfficial CED data for this course could not be loaded. Use your best knowledge of the AP ${entry.displayName} curriculum as published by College Board, and stay within typical AP exam scope.`
    );
  }

  // 3. Pre-exam wellness mode
  if (preExamMode) {
    sections.push(
      preExamSession <= 1
        ? PRE_EXAM_WELLNESS_PROMPT_SESSION_1
        : PRE_EXAM_WELLNESS_PROMPT_SESSION_2_PLUS
    );
  }

  // 4. Active learning rules
  sections.push(AP_PREP_ACTIVE_LEARNING_RULES);

  // 5. Subject-specific pedagogy adaptation
  const pedagogyAdaptation = PEDAGOGY_ADAPTATIONS[entry.subjectArea];
  if (pedagogyAdaptation) {
    sections.push(pedagogyAdaptation);
  }

  // 6. Session opening instruction + off-topic rules
  sections.push(INTERACTION_MODES_INTRO);
  sections.push(OFF_TOPIC_RULES);

  // 7. Contextual metadata instruction
  sections.push(CONTEXTUAL_METADATA_INSTRUCTION);

  return sections.join('\n\n---\n\n');
}

/** One AP/IB multiple-choice item, as the prompts below ask the model to return it. */
export interface ApMCQ {
  id: string;
  stimulus?: string;
  question: string;
  options: Record<'A' | 'B' | 'C' | 'D', string>;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

/** Independent items come back as a list; passage items share one stimulus. */
export type ApMCQSet = ApMCQ[] | { stimulus?: string; questions?: ApMCQ[] };

export interface ApFRQPart {
  letter: string;
  question: string;
  points: number;
  rubric: string;
}

export interface ApFRQ {
  id: string;
  stimulus?: string;
  parts: ApFRQPart[];
}

export interface ApFRQGrade {
  totalPoints: number;
  maxPoints: number;
  parts: { letter: string; pointsEarned: number; feedback: string }[];
  overallSummary: string;
}

interface ApSourceCriterion {
  earned: boolean | number;
  max?: number;
  feedback: string;
}

export interface ApSourceGrade {
  totalPoints: number;
  maxPoints: number;
  breakdown: Record<'thesis' | 'context' | 'evidenceDocs' | 'evidenceBeyond' | 'sourcing' | 'complexity', ApSourceCriterion>;
  overallSummary: string;
}

export interface ApOralGrade {
  score: number;
  fluency: string;
  pronunciation: string;
  taskCompletion: string;
  overallFeedback: string;
}

/**
 * Generate 5 stimulus-based AP MCQs (Independent or Passage format)
 */
export async function getApMCQSet(
  entry: CourseEntry,
  examParam: string | null,
  unit: string,
  format: 'independent' | 'passage'
): Promise<ApMCQSet> {
  const isPassage = format === 'passage';
  const cedData = await loadCedData(entry, examParam);
  const cedBlock = cedData ? buildCedBlock(cedData, entry) : '';
  const pedagogy = PEDAGOGY_ADAPTATIONS[entry.subjectArea] || '';

  const isIB = entry.displayName.startsWith('IB ');
  const examWriterLabel = isIB ? 'IB Science Exam Item Writer' : 'AP Exam Item Writer';
  const taskVerbRule = isIB
    ? "- Questions must use IB cognitive command terms accurately (State, Outline, Describe, Explain, Compare and contrast, Evaluate)."
    : "- Questions must use AP task verbs accurately (Explain, Identify, Predict, Calculate).";
  const scopeRule = isIB
    ? `IB SYLLABUS ALIGNMENT (CRITICAL):
- Before generating any content, verify that the requested unit/topic appears in the syllabus theme/topic list provided. If it does not match exactly, generate content for the closest matching syllabus topic.
- Do NOT generate questions testing content outside the syllabus scope listed above.`
    : CED_SCOPE_RULES;

  const systemInstruction = `
You are a highly specialized ${examWriterLabel}. Your task is to generate exactly 5 high-quality, stimulus-based Multiple Choice Questions (MCQs) for the following course and unit/theme:

COURSE: ${entry.displayName} ${examParam ? `(${examParam})` : ""}
UNIT/THEME: ${unit}
FORMAT: ${isPassage ? "PASSAGE-BASED (5 questions on one shared stimulus)" : "INDEPENDENT (5 questions each with their own stimulus)"}

${cedBlock}

${pedagogy}

${scopeRule}

${STIMULUS_RULES}

${FORMATTING_RULES}

GENERAL MCQ RULES:
${taskVerbRule}
- Distractors MUST be plausible and based on common student misconceptions.
- All 4 options (A-D) must be of similar length.
- Randomize the position of the correct answer across A, B, C, and D.

${isPassage ? `PASSAGE-BASED FORMAT:
Generate ONE shared stimulus (a 300–500 word passage, a detailed data table, or a rich experimental scenario with multiple data points). All 5 questions must reference this shared stimulus.
Each question stem should begin with "Based on the passage above," or "According to the data," or similar.

OUTPUT FORMAT — return a JSON object:
{
  "stimulus": "string (the shared passage/data/scenario — markdown allowed, use mermaid or tables for data)",
  "questions": [
    {
      "id": "string",
      "question": "string",
      "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
      "correctAnswer": "A" | "B" | "C" | "D",
      "explanation": "string"
    }
  ]
}` : `INDEPENDENT FORMAT:
Each of the 5 questions has its own short stimulus (a specific data table, a brief scenario with concrete numbers, or a mermaid diagram).

OUTPUT FORMAT — return a JSON array:
[
  {
    "id": "string",
    "stimulus": "string (markdown allowed — must be actual rendered content, not placeholder language)",
    "question": "string",
    "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
    "correctAnswer": "A" | "B" | "C" | "D",
    "explanation": "string (explain why the correct answer is right and why each distractor is wrong)"
  }
]`}

Do NOT include any commentary before or after the JSON.
`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: `Generate 5 ${isPassage ? "passage-based" : "independent"} MCQs for Unit/Theme ${unit} of ${entry.displayName}.` }
      ]
    }
  ];

  const response = await callAI(DEFAULT_MODEL, contents, {
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonResponse(response.text));
}

/**
 * Generate 1 high-fidelity multi-part AP/IB FRQ
 */
export async function getApFRQ(
  entry: CourseEntry,
  examParam: string | null,
  topic: string
): Promise<ApFRQ> {
  const cedData = await loadCedData(entry, examParam);
  const cedBlock = cedData ? buildCedBlock(cedData, entry) : '';
  const pedagogy = PEDAGOGY_ADAPTATIONS[entry.subjectArea] || '';

  const isIB = entry.displayName.startsWith('IB ');
  const examWriterLabel = isIB ? 'IB Science Exam Item Writer' : 'AP Exam Item Writer';
  const frqLabel = isIB ? 'Constructed Response Question (CRQ)' : 'Free Response Question (FRQ)';
  const taskVerbLabel = isIB ? 'IB cognitive command term' : 'AP task verb';
  const taskVerbExamples = isIB ? 'State, Outline, Explain, Evaluate, Compare and contrast' : 'Explain, Describe, Calculate, Justify';
  const boldInstruction = isIB
    ? `In the "question" field for each part, bold ONLY the IB cognitive command term using **double asterisks** (e.g., "**Explain** why the population stabilizes."). Do not bold any other text.`
    : `In the "question" field for each part, bold ONLY the AP task verb using **double asterisks** (e.g., "**Explain** why the population stabilizes."). Do not bold any other text.`;
  const scopeRule = isIB
    ? `IB SYLLABUS ALIGNMENT (CRITICAL):
- Before generating any content, verify that the requested unit/topic appears in the syllabus theme/topic list provided. If it does not match exactly, generate content for the closest matching syllabus topic.
- Do NOT generate questions testing content outside the syllabus scope listed above.`
    : CED_SCOPE_RULES;

  const systemInstruction = `
You are a highly specialized ${examWriterLabel}. Your task is to generate exactly 1 high-fidelity ${frqLabel} for the following course and topic:

COURSE: ${entry.displayName} ${examParam ? `(${examParam})` : ""}
TOPIC: ${topic}

${cedBlock}

${pedagogy}

${scopeRule}

${isIB ? 'CRQ' : 'FRQ'} RULES:
- The question must be stimulus-based (graph, data table, experiment, passage).
- The ${isIB ? 'CRQ' : 'FRQ'} must be divided into 3-4 sub-parts (a, b, c, d).
- Each sub-part must use an ${taskVerbLabel} precisely (${taskVerbExamples}).
- You must provide a detailed grading rubric for each part.
- The rubric should specify exactly what is required to earn the point(s).
- ${boldInstruction}

${STIMULUS_RULES}

${FORMATTING_RULES}

OUTPUT FORMAT:
You MUST output a valid JSON object with this exact structure:
{
  "id": "string",
  "stimulus": "string (markdown allowed — must be actual rendered content with real data/diagrams)",
  "parts": [
    {
      "letter": "a",
      "question": "string (bold only the task verb/command term with **double asterisks**)",
      "points": number,
      "rubric": "string (explicit criteria for the points — no LaTeX, no backslashes)"
    }
  ]
}

Do NOT include any commentary before or after the JSON.
`;

  const contents = [
    {
      role: 'user',
      parts: [
        { text: `Generate a full ${isIB ? 'IB-style CRQ' : 'AP-style FRQ'} for the topic: ${topic}.` }
      ]
    }
  ];

  const response = await callAI(DEFAULT_MODEL, contents, {
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonResponse(response.text));
}

/**
 * Evaluates/Grades a student's responses to a multi-part FRQ/CRQ
 */
export async function gradeApFRQ(
  courseName: string,
  parts: ApFRQPart[],
  answers: { letter: string; answer: string; attachment?: { mimeType: string; data: string } | null }[]
): Promise<ApFRQGrade> {
  const isIB = courseName.startsWith('IB ');
  const systemInstruction = `
You are a highly specialized ${isIB ? 'IB Science Exam Examiner' : 'AP Exam Grader'} for ${courseName}. Your task is to grade a student's responses to a multi-part ${isIB ? 'Constructed Response Question (CRQ)' : 'Free Response Question (FRQ)'} based on the official grading rubric.

STRUCTURE OF INPUT:
- You will be provided with the student's answers (Part a, Part b, etc.)
- You will be provided with the official rubric and maximum points for each part.

GOAL:
- **Be fair but strict**: Only award points if the student meets the specific criteria in the rubric. 
- **Explain why**: For each part, provide a brief (1-2 sentence) explanation of why they earned or lost a point.
- **Provide a summary**: Briefly state their overall performance (e.g. "Strong understanding of concept X, but missing mechanism in Part b").

OUTPUT FORMAT:
You MUST output a valid JSON object with this exact structure:
{
  "totalPoints": number,
  "maxPoints": number,
  "parts": [
    {
      "letter": "string",
      "pointsEarned": number,
      "feedback": "string"
    }
  ],
  "overallSummary": "string"
}

Do NOT include any commentary before or after the JSON.
`;

  const promptText = `
Course: ${courseName}

Student Answers:
${answers.map(a => `Part ${a.letter}: ${a.answer || "(no text response)"}${a.attachment ? " [See attached image]" : ""}`).join("\n")}

Official Rubrics:
${parts.map(p => `Part ${p.letter} (${p.points} points max): ${p.rubric}`).join("\n")}
`;

  const contentParts: Part[] = [{ text: promptText }];
  for (const a of answers) {
    if (a.attachment?.data) {
      contentParts.push({ inlineData: { mimeType: a.attachment.mimeType, data: a.attachment.data } });
    }
  }

  const response = await callAI(DEFAULT_MODEL, [{ role: 'user', parts: contentParts }], {
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonResponse(response.text));
}

/**
 * Grade a student's DBQ/Source-Based Synthesis essay
 */
export async function gradeApSource(
  courseName: string,
  prompt: string,
  documents: { id: string; metadata: string; content: string }[],
  rubric: Record<string, string>,
  essay: string
): Promise<ApSourceGrade> {
  const systemInstruction = `
You are a highly specialized AP Exam Grader for ${courseName}. Your task is to evaluate a student's Source-Based Essay (DBQ or Synthesis) based on official College Board grading standards.

SCORING CRITERIA (7 Points Total):
1. **Thesis/Claim (1pt)**: Responds to the prompt with a historically defensible thesis or claim that establishes a line of reasoning.
2. **Contextualization (1pt)**: Describes a broader historical context relevant to the prompt.
3. **Evidence from Documents (2pts)**: 
    - Use content from at least 3 documents to address the prompt (1pt).
    - Use content from at least 6 documents to support an argument (2pts).
4. **Evidence Beyond Documents (1pt)**: Uses at least one additional piece of specific historical evidence (beyond the documents) relevant to an argument about the prompt.
5. **Sourcing/HIPP (1pt)**: For at least 3 documents, explains how or why the document's point of view, intended audience, purpose, and/or historical situation is relevant to an argument.
6. **Complexity (1pt)**: Demonstrates a complex understanding of the historical development that is the focus of the prompt.

OUTPUT FORMAT:
You MUST output a valid JSON object with this exact structure:
{
  "totalPoints": number,
  "maxPoints": 7,
  "breakdown": {
    "thesis": { "earned": boolean, "feedback": "string" },
    "context": { "earned": boolean, "feedback": "string" },
    "evidenceDocs": { "earned": number, "max": 2, "feedback": "string" },
    "evidenceBeyond": { "earned": boolean, "feedback": "string" },
    "sourcing": { "earned": boolean, "feedback": "string" },
    "complexity": { "earned": boolean, "feedback": "string" }
  },
  "overallSummary": "string"
}

Do NOT include any commentary before or after the JSON.
`;

  const promptMessage = `
Course: ${courseName}
Prompt: ${prompt}

Documents Provided:
${documents.map(d => `Doc ${d.id}: ${d.metadata}\nContent: ${d.content}\n`).join("\n")}

Official Rubric Guide:
${JSON.stringify(rubric, null, 2)}

Student Essay:
---
${essay}
---
`;

  const response = await callAI(DEFAULT_MODEL, [{ role: 'user', parts: [{ text: promptMessage }] }], {
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonResponse(response.text));
}

/**
 * Grade a student's oral language practice (speaking prompt)
 */
export async function gradeApOral(
  courseName: string,
  topic: string,
  audioBase64: string,
  mimeType: string
): Promise<ApOralGrade> {
  const systemInstruction = `
You are a highly specialized AP World Language Examiner for ${courseName}. Your task is to evaluate a student's oral response based on official College Board grading standards (0-6 scale).

CRITERIA:
1. **Interpersonal/Presentational Communication**: How well did they address the specific prompt?
2. **Vocabulary/Grammar**: Range and accuracy of language.
3. **Fluency/Pronunciation**: Smoothness of speech and accuracy of accent.

OUTPUT FORMAT:
You MUST output a valid JSON object with this exact structure:
{
  "score": number,
  "fluency": "string (1-2 sentences)",
  "pronunciation": "string (1-2 sentences)",
  "taskCompletion": "string (1-2 sentences)",
  "overallFeedback": "string"
}

Do NOT include any commentary before or after the JSON.
`;

  const response = await callAI(DEFAULT_MODEL, [
    {
      role: 'user',
      parts: [
        { text: `Grade this oral response for the prompt: ${topic}` },
        { inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } }
      ]
    }
  ], {
    systemInstruction,
    responseMimeType: 'application/json'
  });

  return JSON.parse(cleanJsonResponse(response.text));
}
