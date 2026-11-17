import { Type } from "@google/genai";
import { CourseType, ChatMessage, ResearchState } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

export const getResearchMentorResponse = async (
  course: CourseType,
  projectContext: string,
  history: ChatMessage[],
  persona: string = 'Socratic',
  standard: string = 'NGSS/AP'
): Promise<string> => {
  try {
    const ctx = getCourseContext(course);

    // Filter history
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    let personaInstruction = "";
    if (persona === 'Skeptic') {
      personaInstruction = "You are a Critical Peer Reviewer. Challenge their methodology. Ask about controls and variables. Do not just agree.";
    } else if (persona === 'Growth Coach') {
      personaInstruction = "You are a Growth Coach. Build confidence, validate progress and effort, then push them to the next level.";
    } else if (persona === 'Tutor') {
      personaInstruction = "You are a direct Tutor. Give specific advice on formatting and standards.";
    } else {
      personaInstruction = "You are a Socratic Research Mentor. Guide them with questions.";
    }

    const systemPrompt = `
      ${ctx.role}
      MODE: Independent Research Mentor
      COURSE: ${course}
      STANDARD: ${standard} (Ensure advice aligns with these standards)

      PERSONA: ${personaInstruction}

      PROJECT CONTEXT:
      "${projectContext}"

      GOALS:
      1. Help the student design, execute, and analyze a long-term science project.
      2. If they ask to "Review Literature", suggest specific search queries (not fake URLs).
      3. If they ask to "Check Methodology", look for confounding variables, lack of controls, or safety issues.
      4. If they ask about "Lab Report Formatting", guide them on the standard structure (Abstract, Intro, Methods, Data, Discussion).
      5. "Idea Boarding": If they are stuck, ask questions to help them brainstorm.

      CRITICAL:
      - Always refer to their specific project details in the Context.
      - Be concise.
    `;

    const contents = [...chatHistory];
    if (contents.length === 0) contents.push({ role: 'user', parts: [{ text: "Hi mentor, I need help with my project." }] });

    const response = await callAI(DEFAULT_MODEL, contents, { systemInstruction: systemPrompt });
    return response.text || "I'm ready to help with your research.";

  } catch (err) {
    console.error("Research Mentor failed:", err);
    return "I couldn't access your project data right now.";
  }
};

export const parseResearchMaterials = async (filename: string, content: string): Promise<Partial<ResearchState>> => {
  try {
    const prompt = `
      TASK: Extract research project details from this file content.
      FILE: ${filename}
      CONTENT: ${content.substring(0, 20000)} // Truncate if too huge

      OUTPUT: JSON with keys:
      - question (The main research question)
      - hypothesis (If present)
      - methodology (Procedures, materials)
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          hypothesis: { type: Type.STRING },
          methodology: { type: Type.STRING }
        }
      }
    });

    const clean = cleanJsonResponse(response.text || "{}");
    return JSON.parse(clean);

  } catch (err) {
    console.error("Parse failed", err);
    return {};
  }
};
