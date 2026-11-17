import { Type } from "@google/genai";
import { CourseType, TestConfig, TestSection } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

export const generateTest = async (
  config: TestConfig
): Promise<TestSection[]> => {
  try {
    const ctx = getCourseContext(config.course as CourseType);

    let structurePrompt = "";

    if (config.selectedStructure === 'Three-Section') {
      structurePrompt = `
        STRUCTURE: "Three-Section Science Model" (Rigorous Assessment)

        PART 1: FOUNDATIONAL KNOWLEDGE (approx 40% of test)
        - Focus: Recall, definitions, basic identification.
        - Question Types: Multiple Choice (MCQ), Fill in the Blank, Matching (formatted as MCQ).
        - Difficulty: Easy to Medium.

        PART 2: APPLICATION & ANALYSIS (approx 40% of test)
        - Focus: Applying concepts to new situations, analyzing diagrams/data, simple calculations.
        - Question Types: MCQ with scenarios, Short Answer (SA).
        - Difficulty: Medium to Hard.

        PART 3: SYNTHESIS & TRANSFER (approx 20% of test)
        - Focus: Connecting multiple concepts, experimental design, complex problem solving.
        - Question Types: Extended Short Answer (SA), Multi-part logical reasoning.
        - Difficulty: Hard / AP Level.
      `;
    } else {
      structurePrompt = `
        STRUCTURE: Custom Build
        - MCQs: ${config.mcqCount}
        - Short Answer: ${config.saCount}
        - Calculations: ${config.calculationCount}
      `;
    }

    const prompt = `
      ${ctx.role}
      TASK: Generate a comprehensive Unit Test.

      CONTEXT:
      - Course: ${config.course}
      - Unit: "${config.unitTitle}"
      - Alignment: ${config.powerStandards ? `Aligned to standards: ${config.powerStandards}` : "Standard Curriculum Alignment"}
      - Rigor Level: ${config.rigorProfile}

      ${structurePrompt}

      OUTPUT FORMAT:
      Return a JSON object with a "sections" array.
      Each "section" must have:
      - "title": string (e.g. "Part I: Foundations")
      - "instructions": string (Instructions for the student)
      - "questions": Array of Question Objects (same schema as usual).

      Ensure a mix of question types as specified.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                instructions: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      text: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ["mcq", "sa", "error_correction", "fill_in_blank"] },
                      subType: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      scenario: { type: Type.STRING }
                    },
                    required: ["text", "type", "correctAnswer"]
                  }
                }
              },
              required: ["title", "instructions", "questions"]
            }
          }
        },
        required: ["sections"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { sections: TestSection[] } = JSON.parse(cleanText || "{\"sections\": []}");

    // Post-process IDs
    return result.sections.map((section, sIdx) => ({
      ...section,
      questions: section.questions.map((q, qIdx) => ({
        ...q,
        id: `test-q-${sIdx}-${qIdx}-${Date.now()}`,
        unit: config.unitTitle,
        topic: config.unitTitle
      }))
    }));

  } catch (err) {
    console.error("Test generation failed:", err);
    throw new Error("Failed to generate test. Please try again.");
  }
};
