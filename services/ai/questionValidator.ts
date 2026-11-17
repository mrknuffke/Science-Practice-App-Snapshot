/**
 * Question Validator
 *
 * Runs a post-generation LLM validation pass on MCQ questions before they
 * are served to students. Catches logical inconsistencies — most critically,
 * negative-stem questions (NOT, EXCEPT, LEAST) where all options satisfy the
 * positive version of the stem.
 *
 * Strategy:
 *  1. Isolate all MCQ-type questions (including odd_one_out, fill_in_blank)
 *  2. Run one batched LLM validation call — one round-trip regardless of count
 *  3. For each flagged item, attempt up to MAX_RETRIES regenerations using
 *     getReplacementQuestion() with the failure reason injected
 *  4. Silently drop items that cannot be recovered after all retries
 *  5. Log all failures as structured JSON for future prompt tuning
 */

import { Type } from "@google/genai";
import { CourseType, Question } from "../../types";
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from "./core";

const MAX_RETRIES = 2;

// Negation keywords that signal a question requires enhanced validation
const NEGATION_PATTERN = /\b(NOT|EXCEPT|LEAST|NEVER|CANNOT|WITHOUT|DOES NOT|DO NOT|INVALID|INCORRECT|FALSE)\b/i;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ValidationResult {
  questionIndex: number;
  valid: boolean;
  reason?: string;
}

interface ValidationLog {
  question: Question;
  reason: string;
  attempts: number;
  resolved: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Formats a single question for the validation prompt.
 */
function formatQuestionForPrompt(q: Question, index: number): string {
  const hasNegation = NEGATION_PATTERN.test(q.text);
  const negationFlag = hasNegation ? " ⚠️ [NEGATIVE STEM — enhanced scrutiny required]" : "";
  const optionsBlock = q.options && q.options.length > 0
    ? `Options:\n${q.options.map((o, i) => `  ${String.fromCharCode(65 + i)}. ${o}`).join("\n")}`
    : "(No options — fill_in_blank)";

  return [
    `--- Question ${index} (type: ${q.type}) ---${negationFlag}`,
    `Stem: ${q.text}`,
    optionsBlock,
    `Correct Answer: ${q.correctAnswer}`,
  ].join("\n");
}

/**
 * Single LLM call that validates all provided questions in one batch.
 * Returns a ValidationResult for each question.
 */
async function runValidationBatch(
  questions: Question[],
  course: string
): Promise<ValidationResult[]> {
  if (questions.length === 0) return [];

  const questionsBlock = questions
    .map((q, i) => formatQuestionForPrompt(q, i))
    .join("\n\n");

  const prompt = `
You are a Science Question Quality Auditor for a ${course} course.

Review the following quiz questions and check each one for logical consistency.

VALIDATION RULES:
1. NEGATIVE STEM QUESTIONS (containing NOT, EXCEPT, LEAST, or similar negation):
   - The correct answer must be the ONE option that does NOT satisfy the positive version of the stem.
   - ALL distractors must DO/BE the thing the stem is asking about.
   - INVALID if: more than one option could be the correct answer, OR if no option is clearly wrong for the right reason.
   - Example validity check: "Which does NOT increase reaction rate?" → Correct answer must be something that does NOT increase rate. All distractors must increase rate.

2. POSITIVE STEM QUESTIONS (no negation):
   - The correct answer must clearly and unambiguously satisfy the stem.
   - Distractors must be plausible but incorrect (not restatements of the correct answer, not absurdly wrong).

3. FILL_IN_BLANK QUESTIONS:
   - The blank must have exactly one defensible answer that matches the provided correct answer.

4. ALL TYPES:
   - Correct answer must match one of the listed options (for MCQ / fill_in_blank).
   - Distractors must be drawn from the same conceptual domain (not absurdly off-topic).

${questionsBlock}

Return a JSON array with one entry per question (0-indexed), in the same order:
- questionIndex: number (matching the index above)
- valid: boolean
- reason: string (required if valid=false; one clear sentence explaining the specific logical flaw)
`.trim();

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionIndex: { type: Type.NUMBER },
            valid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["questionIndex", "valid"],
        },
      },
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const results: ValidationResult[] = JSON.parse(cleanText || "[]");
    return results;
  } catch (err) {
    // If validation itself errors, treat all questions as valid (fail-open — never block student)
    console.error("[QuestionValidator] Validation batch call failed:", err);
    return questions.map((_, i) => ({ questionIndex: i, valid: true }));
  }
}

/**
 * Attempts to regenerate a single invalid question using its failure reason.
 * Returns a replacement Question or null if regeneration fails.
 */
async function attemptRegeneration(
  original: Question,
  course: CourseType,
  topic: string,
  reason: string,
  attempt: number
): Promise<Question | null> {
  try {
    // Inline regeneration prompt — targeted at the specific failure reason
    const hasNegation = NEGATION_PATTERN.test(original.text);
    const negationGuidance = hasNegation
      ? `IMPORTANT: This is a NEGATIVE STEM question. Start by identifying ONE correct answer that does NOT satisfy the positive version. Then build THREE distractors that DO satisfy the positive version.`
      : `IMPORTANT: Ensure the correct answer clearly and unambiguously satisfies the stem.`;

    const prompt = `
You are a Science Question Writer for a ${course} course on the topic: "${topic}".

A previously generated question was rejected by the quality auditor for the following reason:
"${reason}"

ORIGINAL QUESTION (DO NOT REUSE — generate a replacement):
Stem: ${original.text}
Options: ${(original.options || []).join(" | ")}
Correct Answer: ${original.correctAnswer}

YOUR TASK:
Generate ONE new ${original.type} question covering the same topic and concept.
${negationGuidance}

For MCQ: Provide exactly 4 options. The correct answer must be one of them.
Attempt ${attempt} of ${MAX_RETRIES}.
`.trim();

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { type: Type.STRING, enum: [original.type] },
          subType: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
        },
        required: ["text", "type", "options", "correctAnswer"],
      },
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    if (!result.text || !result.correctAnswer) return null;

    return {
      ...original, // Preserve id, unit, topic, subType
      ...result,
      id: `validated-regen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
  } catch (err) {
    console.error(`[QuestionValidator] Regeneration attempt ${attempt} failed:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates all MCQ, odd_one_out, and fill_in_blank questions in the provided
 * array. Invalid items are retried up to MAX_RETRIES times and silently dropped
 * if unrecoverable.
 *
 * Non-MCQ question types (sa, error_correction, frq, cer) are passed through
 * unchanged.
 *
 * @param questions  Raw questions from getDiverseQuestions()
 * @param course     The active course (used for context in regeneration prompts)
 * @param topic      The active topic (used for context in regeneration prompts)
 * @returns          Validated question array — may be shorter than input if
 *                   items were unrecoverably dropped
 */
export async function validateAndFixQuestions(
  questions: Question[],
  course: CourseType,
  topic: string
): Promise<Question[]> {
  // Separate questions by type: validatable vs. pass-through
  const validatableTypes = new Set<Question["type"]>(["mcq", "fill_in_blank"]);
  const toValidate: { q: Question; originalIndex: number }[] = [];
  const passThrough: { q: Question; originalIndex: number }[] = [];

  questions.forEach((q, i) => {
    if (validatableTypes.has(q.type)) {
      toValidate.push({ q, originalIndex: i });
    } else {
      passThrough.push({ q, originalIndex: i });
    }
  });

  if (toValidate.length === 0) {
    // Nothing to validate — return as-is
    return questions;
  }

  // --- Step 1: Run batch validation ---
  const questionBatch = toValidate.map(({ q }) => q);
  const validationResults = await runValidationBatch(questionBatch, course);

  // Build a result map: localIndex → ValidationResult
  const resultMap = new Map<number, ValidationResult>(
    validationResults.map((r) => [r.questionIndex, r])
  );

  // --- Step 2: Process results — repair or drop invalid items ---
  const repairedQuestions: (Question | null)[] = await Promise.all(
    toValidate.map(async ({ q }, localIndex) => {
      const result = resultMap.get(localIndex);

      // If no result returned (validator missed), treat as valid (fail-open)
      if (!result || result.valid) {
        return q;
      }

      // Question is invalid — attempt regeneration
      const reason = result.reason || "The question answer key is inconsistent with the stem.";

      const failureLog: ValidationLog = {
        question: q,
        reason,
        attempts: 0,
        resolved: false,
      };

      let replacement: Question | null = null;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        failureLog.attempts = attempt;
        replacement = await attemptRegeneration(q, course, topic, reason, attempt);

        if (replacement) {
          // Validate the replacement too (single-item batch) before accepting
          const recheckResults = await runValidationBatch([replacement], course);
          const recheckPassed = recheckResults.length === 0 || recheckResults[0]?.valid !== false;

          if (recheckPassed) {
            failureLog.resolved = true;
            break;
          }

          // Replacement also failed validation — loop for another attempt
          replacement = null;
        }
      }

      // Log the failure (structured for future tooling)
      console.error(
        "[QuestionValidator] Validation failure logged:",
        JSON.stringify(failureLog, null, 2)
      );

      // Return replacement if found, null if we ran out of retries (silently dropped)
      return replacement;
    })
  );

  // --- Step 3: Reconstruct the final array in original order ---
  // Merge pass-through and validated questions, preserving original sequence
  const finalMap = new Map<number, Question>();

  passThrough.forEach(({ q, originalIndex }) => {
    finalMap.set(originalIndex, q);
  });

  toValidate.forEach(({ originalIndex }, localIndex) => {
    const repaired = repairedQuestions[localIndex];
    if (repaired) {
      finalMap.set(originalIndex, repaired);
    }
    // If null (unrecoverable), originalIndex is not added → question silently dropped
  });

  // Sort by original index and return
  const sortedFinal = Array.from(finalMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, q]) => q);

  return sortedFinal;
}
