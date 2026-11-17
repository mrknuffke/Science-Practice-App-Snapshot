import { Type } from "@google/genai";
import { CourseType, ChatMessage, Question, GradingReport, AIExplanation } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

/**
 * GENERATE EXPLANATION REPORT
 * Complex task: Assessing depth of knowledge. Uses DEFAULT_MODEL for consistency.
 */
export const getExplanationReport = async (
  course: CourseType,
  topic: string,
  history: ChatMessage[]
): Promise<GradingReport> => {
  try {
    const ctx = getCourseContext(course);

    const transcript = history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n');

    const prompt = `
      ${ctx.role}
      Topic: ${topic}

      Task: Analyze the following tutoring transcript where the student tried to explain "${topic}".

      TRANSCRIPT:
      ${transcript}

       GENERATE A REPORT:
       1. Score: Assess their understanding (S, A, B, C, or "Needs Review").
          - Be generous. If they got the main idea, give them a good score.
       2. Summary: Brief assessment of their grasp of the topic.
       3. Detailed Feedback: Break down the conversation into 2-3 key concepts discussed.
          - "Question": The sub-concept being discussed.
          - "Student Answer": Summary of what they said.
          - "Evaluation": Correct/Incorrect/Partial.
          - "Feedback": Specific advice. Validating -> Gentle Correction -> Next Step.
       4. Study Recommendations: 3 active learning tasks.
       5. Badge: Award a "Silly Scientist" badge.
          - Name: Something fun and punny (e.g. "The Isotope Icon", "Captain Mitochondria").
          - Emoji: A relevant emoji.
          - Rarity: Determined by score (Common/Uncommon/Rare/Ultra Rare).
       6. Resource Links:
          - Do NOT provide direct URLs.
          - Provide "searchQueries": A list of 2-3 specific search strings the student can use to find good videos or articles (e.g. "OpenStax Biology Photosynthesis", "YouTube Amoeba Sisters Cellular Respiration").
        7. Factual Accuracy Confidence (Self-Estimation of Truthfulness):
           Self-assess your confidence that this grading is factually accurate, free of hallucinations, and strictly truthful on a scale of 1-5:
           - 5: Extremely Confident (Factual certainty; settled scientific consensus, double-verified by internal benchmarks).
           - 4: Highly Confident (Strong consensus, standard scientific model, very low risk of error).
           - 3: Moderately Confident (Conceptually sound, but specific terminology or phrasing could have minor variance).
           - 2: Slightly Uncertain (Frontier concept or complex synthesis; some risk of simplified modeling or minor gaps).
           - 1: High Uncertainty / Speculative (Complex custom query or highly speculative scientific frontier; moderate hallucination risk).
           Provide 2-4 short factor strings explaining the rating in a "certainty" block containing "level" and "factors".
     `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.STRING },
          summary: { type: Type.STRING },
          detailedFeedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING, description: "The concept discussed" },
                studentAnswer: { type: Type.STRING, description: "Summary of student's explanation" },
                evaluation: { type: Type.STRING, enum: ["Correct", "Incorrect", "Partially Correct"] },
                feedback: { type: Type.STRING },
                textbookReference: { type: Type.STRING, description: `Text citation (e.g. ${ctx.textbook})` },
                searchQueries: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 specific search query strings" },
                tutorDeepDive: { type: Type.STRING },
                keyConcept: { type: Type.STRING },
                misconceptionAlert: { type: Type.STRING }
              },
              required: ["question", "studentAnswer", "evaluation", "feedback", "textbookReference", "searchQueries", "tutorDeepDive", "keyConcept", "misconceptionAlert"]
            }
          },
          studyRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          badge: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              emoji: { type: Type.STRING }
            },
            required: ["name", "description", "emoji"]
          },
          certainty: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.INTEGER, description: "1-5 self-assessed reliability rating" },
              factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Reasons for the level rating" }
            },
            required: ["level", "factors"]
          }
        },
        required: ["score", "summary", "detailedFeedback", "studyRecommendations", "badge", "certainty"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    return JSON.parse(cleanText || "{}");

  } catch (err) {
    console.error("Report generation failed", err);
    throw err;
  }
};

/**
 * GENERATE DIAGNOSTIC REPORT
 * Complex task: Grading against rubric and creating study plan. Uses DEFAULT_MODEL.
 */
export const getDiagnosticReport = async (
  course: CourseType,
  unit: string,
  topic: string,
  questions: Question[],
  answers: Record<number, string>,
  includeVisuals: boolean = false
): Promise<GradingReport> => {
  try {
    const ctx = getCourseContext(course);

    const isFRQ = questions.length === 1 && questions[0].type === 'frq';
    const isCER = questions.length === 1 && questions[0].type === 'cer';

    let quizDisplay = "";
    if (isCER || isFRQ) {
      // Special handling for FRQ/CER composite answer
      // Need to include the exhibit descriptions in the context so the grader knows what the user was looking at
      const exhibitContext = questions[0].exhibits
        ? questions[0].exhibits.map(e => `[Exhibit: ${e.title} (${e.type})]`).join('\n')
        : "No exhibits found.";

      quizDisplay = `
         SCENARIO/CONTEXT: ${questions[0].scenario}
         EXHIBITS PROVIDED TO STUDENT:
         ${exhibitContext}

         QUESTIONS:
         ${questions[0].subQuestions ? questions[0].subQuestions.join('\n') : questions[0].text}

         STUDENT RESPONSE:
         ${JSON.stringify(answers)}
         `;
    } else {
      quizDisplay = questions.map((q, i) => {
        let display = `Q${i + 1} (${q.type}): ${q.text}\n`;
        if (q.options && q.options.length > 0) {
          display += `  Available Options:\n${q.options.map((o, idx) => `    - ${String.fromCharCode(65 + idx)}: ${o}`).join('\n')}\n`;
        }
        if (q.correctAnswer) {
          display += `  Expected Correct Answer: ${q.correctAnswer}\n`;
        }
        display += `  Student Answer: ${answers[i] || "N/A"}\n`;
        return display;
      }).join('\n\n');
    }

    let extraInstruction = "";
    if (course.includes("Middle School")) {
      extraInstruction = "Provide EXTREMELY CLEAR explanations. Use simple analogies appropriate for 6th-8th graders. Avoid complex jargon unless defined immediately.";
    }
    if (course.includes("Elementary School")) {
      extraInstruction = "Provide VERY SIMPLE and FUN explanations. Speak like you are talking to an 8-year-old. Use emojis. Keep sentences short. Focus on the 'big picture' idea.";
    }
    if (course.startsWith("IB ")) {
      extraInstruction += `
### IB COMMAND TERM GRADING RULE:
You are grading an IB Science response. You must evaluate the student's answer against the precise Command Term used in the question:
1. If the question uses "State", "List", or "Identify", expect a direct, concise fact.
2. If the question uses "Describe" or "Outline", expect key physical steps, properties, or sequences with no deep causal explanation.
3. If the question uses "Explain", the student MUST provide causal mechanisms (using terms like 'because', 'due to', 'leads to', or molecular processes). If they only described without explaining, they cannot receive full marks.
4. If the question uses "Evaluate", "Discuss", or "To what extent", the student MUST present a balanced view with both supporting arguments (pros/strengths) and opposing points (cons/limitations), ending with a logical conclusion. If they only present one side, they must be penalized.

Explicitly outline in your 'detailedFeedback' whether they successfully met the cognitive demand of the Command Term.
`;
    }

    // FRQ/CER Specific Logic
    if (isFRQ) {
      const isIB = course.startsWith("IB ");
      extraInstruction += `
        \nIMPORTANT: THIS IS AN ${isIB ? 'IB Constructed Response' : 'AP FRQ'}.
        1. Score based on Conceptual Understanding. Do not be overly pedantic about keywords if the meaning is clear.
        2. In the 'rubricScore' field, list points earned (e.g. "+3/4").
        3. The 'score' field should be the total (e.g. "6/10").
        4. If exhibits (graphs/tables) were provided, check if the student referenced them correctly.
        5. RUBRIC BREAKDOWN & MODEL ANSWER (MANDATORY FOR FRQ):
           - In 'modelAnswer', provide an ideal gold-standard exemplar answer illustrating full-point scientific precision, clear logical links, and correct units.
           - In 'rubricBreakdown', provide a structured evaluation for each sub-question part or core task demand (e.g. "Part A: Identify", "Part B: Explain", "Part C: Calculate/Predict"):
             - criterion: The part or demand name (e.g. "Part A: Identify Variable", "Part B: Mechanism Explanation")
             - status: "met" | "partially_met" | "missing"
             - pointsAwarded: Points earned on this specific part (e.g., 1 or 0)
             - pointsPossible: Points possible for this part (e.g., 1)
             - studentExclusionOrMatch: 1-2 sentence assessment of what the student wrote or what was omitted.
             - modelEvidence: The exemplar answer snippet demonstrating how to earn full credit on this part.
             - suggestedRevision: A high-impact 1-sentence tip on how the student could upgrade their sentence to full credit.
        `;
    }

    if (isCER) {
      extraInstruction += `
         \nIMPORTANT: THIS IS A C.E.R. (Claim, Evidence, Reasoning) ASSESSMENT.
         The student was provided with multiple pieces of evidence (Exhibits).

         1. EVALUATE THE CLAIM: Does it directly answer the central question? Is it accurate based on the provided Exhibits?
         2. EVALUATE THE EVIDENCE: Did they cite specific data from BOTH the table and the graph? Did they quote numbers/trends correctly?
         3. EVALUATE THE REASONING: Did they connect the data to a scientific principle to explain WHY the result occurred?
         4. Provide feedback that specifically addresses these 3 components.
         5. RUBRIC BREAKDOWN & MODEL ANSWER (MANDATORY FOR CER):
            - In 'modelAnswer', provide a complete, gold-standard Claim-Evidence-Reasoning exemplar answer citing data and scientific mechanisms.
            - In 'rubricBreakdown', provide exactly 3 criterion objects:
              1. "Claim / Direct Answer": Did the claim answer the core prompt accurately?
              2. "Evidence / Data Citation": Did they quote specific data, numbers, and exhibit trends?
              3. "Scientific Reasoning / Mechanism": Did they explain WHY using the underlying scientific law or mechanism?
              For each criterion include:
              - criterion: "Claim", "Evidence", or "Reasoning"
              - status: "met" | "partially_met" | "missing"
              - pointsAwarded: Points earned (e.g. 1, 0.5, or 0)
              - pointsPossible: Points possible (e.g. 1)
              - studentExclusionOrMatch: Summary of how the student addressed this element or what was missing.
              - modelEvidence: How the exemplar met this element.
              - suggestedRevision: Actionable 1-sentence rewrite suggestion showing how to upgrade this component.
         `;
    }

    const visualInstruction = includeVisuals
      ? "VISUALS: For EACH question, if the concept involves a process, cycle, or decision tree, provide a Mermaid.js 'graph TD' or 'sequenceDiagram' code block in the 'visualMapping' field. If no visual is helpful, set it to null."
      : "VISUALS: Do NOT generate any visuals. Set 'visualMapping' to null.";

    const prompt = `
      ${ctx.role}
      Assess this ${course} quiz on "${topic}".
      ${extraInstruction}

      CRITICAL RULES:
      1. You MUST provide a specific critique for EVERY single question listed below.
      2. GRADING ALIGNMENT: For multiple-choice questions (MCQs), compare the student's answer against the "Expected Correct Answer" provided. If the student answer matches the expected correct answer, mark it Correct.
      3. MCQ OPTION ANALYSIS: You MUST use the exact options listed under "Available Options" for your "optionAnalysis" object. Do NOT make up or modify these options. Provide accurate feedback explaining why each option is correct or incorrect based on the list.
      4. TONE: Friendly Coach. Use "Validation -> Gentle Correction -> Next Step" model.
         - AVOID: "Incorrect. You failed to mention..."
         - PREFER: "You're on the right track! The key missing piece is..."
         - Do not be 'persnickety'. If they got the core concept, marks it CORRECT.
      5. CITATIONS: All textbookReference fields MUST cite "${ctx.textbook}".
      6. LINKS: Do NOT provide direct URLs, as they may hallucinate. Instead, provide "searchQueries" (e.g. "OpenStax Biology mitosis diagram").
      7. TUTOR INSIGHTS: For EACH question, provide:
         - A "Deep Dive" explaining the scientific mechanism briefly (2-3 sentences).
         - The core "Key Concept" being tested.
         - A "Misconception" students often have.
         - **FOR MCQ ITEMS:** Providing "optionAnalysis" is MANDATORY.
           - You MUST list ALL 4 options from "Available Options" and for EACH, explain briefly why it is right or wrong.
           - The "option" field must be the exact text of the option.
           - Example: [{option: "Mitochondria", explanation: "Correct, it produces ATP."}, {option: "Nucleus", explanation: "Incorrect, detailed reason..."}]
       ${visualInstruction}
      8. DISCLAIMER: Ensure feedback is helpful but remind student to check their class notes.
      9. STUDY RECOMMENDATIONS: Generate 3-5 specific, high-utility active learning tasks.
      10. BADGE SYSTEM:
         - Name: Generate a SILLY, FUN, SCIENTIFIC pun name (e.g. "The Protozoa Pro", "Captain Covalent").
         - Description: A funny reason for the badge.
         - Emoji: A fun emoji.
         - (Rarity and Color will be handled by the frontend based on score).
      11. Factual Accuracy Confidence (Self-Estimation of Truthfulness):
         Self-assess your confidence that this grading and analysis are factually accurate, free of hallucinations, and strictly truthful on a scale of 1-5:
         - 5: Extremely Confident (Factual certainty; settled scientific consensus, double-verified by internal benchmarks).
         - 4: Highly Confident (Strong consensus, standard scientific model, very low risk of error).
         - 3: Moderately Confident (Conceptually sound, but specific terminology or phrasing could have minor variance).
         - 2: Slightly Uncertain (Frontier concept or complex synthesis; some risk of simplified modeling or minor gaps).
         - 1: High Uncertainty / Speculative (Complex custom query or highly speculative scientific frontier; moderate hallucination risk).
         Include 2-4 short factor strings explaining the rating in the "certainty" block containing "level" and "factors".
    `;

    const response = await callAI(DEFAULT_MODEL, prompt + "\n\n" + quizDisplay, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.STRING },
          summary: { type: Type.STRING },
          detailedFeedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                studentAnswer: { type: Type.STRING },
                evaluation: { type: Type.STRING, enum: ["Correct", "Incorrect", "Partially Correct"] },
                feedback: { type: Type.STRING },
                textbookReference: { type: Type.STRING, description: `Text citation (e.g. ${ctx.textbook} 4.2)` },
                searchQueries: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 specific search query strings" },
                tutorDeepDive: { type: Type.STRING },
                keyConcept: { type: Type.STRING },
                misconceptionAlert: { type: Type.STRING },
                rubricScore: { type: Type.STRING, description: "If FRQ, list specific points earned. Else null." },
                visualMapping: { type: Type.STRING, description: "Mermaid.js code block for visualization" },
                modelAnswer: { type: Type.STRING, description: "For FRQ and CER, an ideal model exemplar answer. Else null." },
                rubricBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criterion: { type: Type.STRING },
                      status: { type: Type.STRING, enum: ["met", "partially_met", "missing"] },
                      pointsAwarded: { type: Type.NUMBER },
                      pointsPossible: { type: Type.NUMBER },
                      studentExclusionOrMatch: { type: Type.STRING },
                      modelEvidence: { type: Type.STRING },
                      suggestedRevision: { type: Type.STRING }
                    },
                    required: ["criterion", "status", "studentExclusionOrMatch", "modelEvidence"]
                  },
                  description: "For FRQ and CER, criterion-by-criterion rubric comparison."
                },
                optionAnalysis: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { option: { type: Type.STRING }, explanation: { type: Type.STRING }, isCorrect: { type: Type.BOOLEAN } },
                    required: ["option", "explanation"]
                  },
                  description: "For MCQ, list ALL 4 options and explain why each is correct or incorrect."
                }
              },
              required: ["question", "studentAnswer", "evaluation", "feedback", "textbookReference", "searchQueries", "tutorDeepDive", "keyConcept", "misconceptionAlert"]
            }
          },
          studyRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          badge: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              emoji: { type: Type.STRING }
            },
            required: ["name", "description", "emoji"]
          },
          certainty: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.INTEGER, description: "1-5 self-assessed reliability rating" },
              factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Reasons for the level rating" }
            },
            required: ["level", "factors"]
          }
        },
        required: ["score", "summary", "detailedFeedback", "studyRecommendations", "badge", "certainty"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    return JSON.parse(cleanText || "{}");
  } catch (err) {
    console.error("Grading failed:", err);
    throw err;
  }
};

/**
 * GENERATE AI EXPLANATION (DEEP DIVE)
 * Complex task: Detailed scientific reasoning. Uses DEFAULT_MODEL.
 */
export const getAIExplanation = async (
  course: CourseType,
  question: Question,
  studentAnswer: string,
  includeVisuals: boolean = false
): Promise<AIExplanation> => {
    const ctx = getCourseContext(course);

    const visualInstruction = includeVisuals
      ? "\nVISUAL MAPPING: If the student's misunderstanding involves a process, cycle, or structure, provide a Mermaid.js 'graph TD' or 'sequenceDiagram' code block in the 'visualMapping' field to visualize the correction. If no visual is helpful, leave it null."
      : "\nVISUAL MAPPING: Do NOT generate any visuals. Set 'visualMapping' to null.";

    const prompt = `
      ${ctx.role}
      Deep dive into this ${course} concept: "${question.text}" based on this student attempt: "${studentAnswer}". Explain at a ${ctx.complexity} level.
      ${visualInstruction}

      CERTAINTY (FACTUAL ACCURACY CONFIDENCE):
      Self-assess your confidence that your explanation is factually accurate, free of hallucinations, and strictly truthful based on settled consensus on a scale of 1-5:
      - 5: Extremely Confident (Factual certainty; settled scientific consensus, double-verified by internal benchmarks).
      - 4: Highly Confident (Strong consensus, standard scientific model, very low risk of error).
      - 3: Moderately Confident (Conceptually sound, but specific terminology or phrasing could have minor variance).
      - 2: Slightly Uncertain (Frontier concept or complex synthesis; some risk of simplified modeling or minor gaps).
      - 1: High Uncertainty / Speculative (Complex custom query or highly speculative scientific frontier; moderate hallucination risk).
      Include 2-4 short factors explaining the rating in the "certainty" block containing "level" and "factors".
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          deepDive: { type: Type.STRING },
          keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
          commonMisconceptions: { type: Type.STRING },
          visualMapping: { type: Type.STRING, description: "Mermaid.js code or null" },
          certainty: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.INTEGER, description: "1-5 self-assessed truthfulness/reliability rating" },
              factors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Reasons for the level rating" }
            },
            required: ["level", "factors"]
          }
        },
        required: ["deepDive", "keyConcepts", "commonMisconceptions", "certainty"]
      }
    });
    const cleanText = cleanJsonResponse(response.text || "");
    return JSON.parse(cleanText || "{}") as AIExplanation;
};
