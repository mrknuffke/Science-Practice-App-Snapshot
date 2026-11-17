import { Type } from "@google/genai";
import { CourseType, Question, WorksheetFocus } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

export const getDiverseQuestions = async (
  course: CourseType,
  topics: string | string[], // UPDATED: Accept both single topic and array
  allQuestions: string[],
  mcqCount: number,
  saCount: number,
  errorCount: number,
  difficulty: 'Easy' | 'Medium' | 'Hard',
  worksheetStyle: 'Leveled' | 'Mixed' = 'Mixed',
  worksheetFocus: WorksheetFocus[] = ['Standard Mixed'],
  analogyCount: number = 0,
  oddOneOutCount: number = 0,
  fillInBlankCount: number = 0,
  uploadedContext?: string
): Promise<Question[]> => {
  try {
    const ctx = getCourseContext(course);

    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];
    const topicString = topicArray.join(', ');

    // Build topic instruction for multi-topic or single topic
    let topicInstruction = '';
    if (topicArray.length > 1) {
      topicInstruction = `Topics: "${topicString}"\n\nIMPORTANT: Generate questions that cover ALL of these topics. Distribute questions evenly across topics. Each question's "topic" field should indicate which topic it primarily addresses.`;
    } else if (topicArray[0] === "General Review") {
      topicInstruction = `Topic: Comprehensive Review of the entire ${course} curriculum. Cover multiple major units.`;
    } else {
      topicInstruction = `Topic: "${topicArray[0]}"`;
    }

    if (uploadedContext) {
      topicInstruction += `\nPRIORITY CONTEXT: Use the following user-uploaded notes to guide question generation. Ensure questions map to concepts found here:\n"${uploadedContext.substring(0, 2000)}..."`;
    }

    let orderInstruction = "";
    if (worksheetStyle === 'Leveled') {
      orderInstruction = "For the output array, order the questions roughly by difficulty: Start with foundational recall questions (Easy) and move towards complex analysis/synthesis questions (Hard).";
    } else {
      orderInstruction = "Randomly interleave difficulty levels and question types.";
    }

    // Build mixed focus instruction string
    let focusInstruction = "Provide a balanced mix of conceptual and application questions.";
    if (worksheetFocus && worksheetFocus.length > 0) {
      const focusList = worksheetFocus.join(", ");
      focusInstruction = `CRITICAL: The questions must address the following focus areas: ${focusList}.
       - If 'Data Analysis' is selected, include questions involving tables or results.
       - If 'Math & Problem Solving' is selected, include calculations.
       - If 'CER Practice' is selected, ask for evidence-based reasoning.
       Ensure a good variety based on the selected mix.`;
    }

    const totalCount = mcqCount + saCount + errorCount + analogyCount + oddOneOutCount + fillInBlankCount;

    let prompt = `
      ${ctx.role}
      Course: ${course}
      ${topicInstruction}
      Standard: ${ctx.standard}
      Target Difficulty Setting: ${difficulty}
      Focus Area Mix: ${worksheetFocus?.join(', ') || 'Standard'}

      TASK:
      Generate exactly ${totalCount} questions.
      - ${mcqCount} Standard Multiple Choice Questions.
      - ${saCount} Standard Short Answer Questions.
      - ${errorCount} Error Correction Questions.
      - ${analogyCount} Analogy Questions. Phrase as "Complete the analogy: A is to B as C is to..." or "Explain why X is like Y". (Type: "sa", subType: "analogy")
      - ${oddOneOutCount} Odd One Out Questions. Provide 4 options where one is conceptually different. The Question Text must ask "Which of the following is the odd one out?" and explain why in the feedback/correct answer. (Type: "mcq", subType: "odd_one_out")
      - ${fillInBlankCount} Fill in the Blank Questions. Provide a sentence with a missing key term (represented by _____). The question text should be the sentence. (Type: "fill_in_blank", subType: "recall")

      FOCUS INSTRUCTION:
      ${focusInstruction}

      MCQ QUALITY RULES:
      - Complexity Level: Adjust to ${difficulty}.
        (Easy = Recall/Definiton, Medium = Application, Hard = Synthesis/Evaluation).
      - Each MCQ MUST have 4 distinct, technically accurate options.
      - DO NOT use placeholders like "Option A", "Option B", etc.
      - One option must be the correct answer.
      - Three options must be plausible distractors (common student misconceptions).
      - BALANCED OPTION LENGTH (CRITICAL ANTI-GIVEAWAY): All 4 options MUST be roughly equal in word count and grammatical structure. The correct answer must NEVER be noticeably longer or more detailed than distractors (length ratio <= 1.8x).
      - PUNCHY TEACHER REGISTER: Write direct, conversational stems and options adhering to the course register tier. Avoid inflated academic jargon, GRE testing-board tone, and em-dashes.

      NEGATIVE STEM MCQ RULES (CRITICAL: applies whenever stem uses NOT, EXCEPT, LEAST, or similar negation):
      - Step 1: Identify ONE concept that does NOT satisfy the positive version of the stem. This becomes the CORRECT ANSWER.
      - Step 2: Generate THREE distractors that DO satisfy the positive version of the stem.
      - Step 3: Verify your work: re-read the stem and confirm that only the correct answer "breaks" the rule.
      - NEVER write a negative-stem question where all four options satisfy the same direction. If you cannot find a valid correct answer, write a positive-stem question instead.
      - Example: "Which does NOT increase reaction rate?" → Correct answer: "Removing the catalyst" (does NOT increase rate). Distractors: "Adding a catalyst", "Increasing temperature", "Increasing concentration" (all DO increase rate).

      EC (ERROR CATCHER) RULES:
      - Provide a single statement that sounds plausible but contains a distinct conceptual or factual error related to the topic.
      - Do NOT reveal the error in the question text.
      - The student's job will be to identify and correct it.

      NEGATIVE CONSTRAINTS (CRITICAL):
      - Do NOT refer to images, graphs, diagrams, or data tables in the question text (e.g. "Refer to Figure 1", "As shown in the graph") UNLESS you explicitly provide them in the 'scenario' or 'exhibits' field (which this tool does not support yet for standard questions, so avoid them).
      - Ensure questions are self-contained.

      ORDERING:
      ${orderInstruction}

      OUTPUT FORMAT:
      Return a JSON object with a "questions" array.
      Each question must include:
      - "text": string
      - "type": "mcq" | "sa" | "error_correction" | "fill_in_blank"
      - "subType": "recall" | "concept" | "application" | "analogy" | "odd_one_out" | "error"
      - "correctAnswer": string
      - "options": string[] (for mcq - 4 options)
      - "topic": string (REQUIRED for multi-topic sessions - indicate which specific topic this question addresses)

      For Analogy: set type="sa", subType="analogy".
      For Odd One Out: set type="mcq", subType="odd_one_out".
      For Error Correction: set type="error_correction", subType="error".
      For others: choose appropriate subType.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
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
                type: { type: Type.STRING, enum: ["mcq", "sa", "error_correction", "fill_in_blank"] },
                subType: { type: Type.STRING },
                topic: { type: Type.STRING, description: "Which specific topic this question addresses" },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "For MCQ: 4 unique options. For SA/EC: Empty array."
                },
                correctAnswer: { type: Type.STRING, description: "The correct answer text" },
                scenario: { type: Type.STRING, description: "Optional context paragraph." },
                exhibits: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['table', 'graph'] },
                      content: { type: Type.STRING }, // HTML table or empty
                      caption: { type: Type.STRING },
                      chartData: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING, enum: ['line', 'bar', 'scatter'] },
                          title: { type: Type.STRING },
                          xAxisLabel: { type: Type.STRING },
                          yAxisLabel: { type: Type.STRING },
                          data: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                x: { type: Type.STRING },
                                y: { type: Type.NUMBER },
                                label: { type: Type.STRING }
                              },
                              required: ["x", "y"]
                            }
                          },
                          series: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: { key: { type: Type.STRING }, name: { type: Type.STRING } },
                              required: ["key", "name"]
                            }
                          }
                        },
                        required: ["type", "data", "series"]
                      }
                    },
                    required: ["title", "type", "content"]
                  },
                  description: "Optional data exhibits for the question."
                }
              },
              required: ["text", "type", "subType", "options", "correctAnswer"]
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
      id: `ai-q-${i}-${Date.now()}`,
      unit: "",
      // Use AI-provided topic if available (for multi-topic), otherwise use first topic from array
      topic: q.topic || topicArray[0]
    }));
  } catch (err) {
    console.error("Gemini API Request Failed:", err);
    throw err;
  }
};

export const generateQuestionFromImage = async (
  imageBase64: string,
  mimeType: string,
  count: number = 1
): Promise<Question[]> => {
  try {
    // Defaulting to general science context for image analysis
    const ctx = getCourseContext('Custom Practice');

    const prompt = `
      ${ctx.role}
      TASK: Analyze the provided scientific image/diagram.
      1. Identify the key scientific concept shown.
      2. Generate exactly ${count} Multiple Choice Questions (MCQ) that test understanding of this specific diagram.

      SCAFFOLDING RULES:
      - You must sequence the questions by difficulty.
      - Question 1: Basic Identification/Observation (What is shown? What is X label?).
      - Intermediate Questions: Application/Relationship (How does X affect Y? What is the function of Z?).
      - Final Question: Synthesis/Analysis/Prediction (What would happen if...? Why is this structure significant?).

      GENERAL RULES:
      - The questions must be directly related to the visual data in the image.
      - Provide 4 distinct options per question.
      - Indicate the correct answer.
      - Provide a brief "scenario" description summarizing what the image depicts (for accessibility).
    `;

    // Important: For Vision, we pass the image part in the contents
    const contents = {
      parts: [
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: prompt
        }
      ]
    };

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
                type: { type: Type.STRING, enum: ["mcq"] },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                scenario: { type: Type.STRING, description: "Description of the image content" }
              },
              required: ["text", "type", "options", "correctAnswer", "scenario"]
            }
          }
        }
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result: { questions?: Question[] } = JSON.parse(cleanText || "{\"questions\": []}");

    if (!result.questions || result.questions.length === 0) return [];

    return result.questions.map((q, i) => ({
      ...q,
      id: `img-q-${i}-${Date.now()}`,
      unit: "Visual Analysis",
      topic: "Image Analysis"
    }));

  } catch (err) {
    console.error("Image analysis failed:", err);
    throw new Error("Could not analyze image. Please try a clearer image.");
  }
};

export const getReplacementQuestion = async (
  course: CourseType,
  topic: string,
  badQuestionText: string,
  type: 'mcq' | 'sa' | 'error_correction' | 'frq' | 'cer' | 'fill_in_blank',
  adjustment: 'easier' | 'harder' | 'standard' = 'standard'
): Promise<Question> => {
  try {
    const ctx = getCourseContext(course);

    let specificInstruction = "";
    if (adjustment === 'easier') {
      specificInstruction = "The user found the previous question too hard. Generate a simpler, more foundational question on the same topic. Reduce vocabulary complexity.";
    } else if (adjustment === 'harder') {
      specificInstruction = "The user found the previous question too easy. Generate a more challenging question that requires deeper synthesis or analysis. Increase rigor.";
    } else {
      specificInstruction = "The user flagged this question as out of scope or poor quality. Generate a replacement.";
    }

    const prompt = `
      ${ctx.role}
      Course: ${course}
      Topic: "${topic}"

      Previous Question: "${badQuestionText}"
      Action: ${specificInstruction}

      TASK:
      Generate ONE question of type: ${type}.
      Ensure it is ${ctx.standard}.
      Complexity: ${ctx.complexity}.

      OUTPUT JSON:
      Include "correctAnswer". For MCQ, it must match one of the options.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          type: { type: Type.STRING, enum: [type] },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "For MCQ: 4 unique options. For SA/EC/FRQ/CER: Empty array."
          },
          correctAnswer: { type: Type.STRING }
        },
        required: ["text", "type", "options", "correctAnswer"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    return {
      ...result,
      id: `ai-replace-${Date.now()}`,
      unit: "",
      topic
    };
  } catch (err) {
    console.error("Replacement failed:", err);
    throw err;
  }
};
