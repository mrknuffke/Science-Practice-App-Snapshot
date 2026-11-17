import { Type } from "@google/genai";
import { CourseType, TopicOverview, ChatMessage } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

export const getTopicOverview = async (
  course: CourseType,
  topic: string,
  uploadedContext?: string
): Promise<TopicOverview> => {
  try {
    const ctx = getCourseContext(course);

    const contextInstruction = uploadedContext
      ? `USER UPLOADED CONTEXT (Prioritize this for the summary): ${uploadedContext.substring(0, 3000)}...` // Truncate to safe limit
      : "No user files uploaded.";

    const prompt = `
      ${ctx.role}
      Course: ${course}
      Topic: "${topic}"
      Standard: ${ctx.standard}

      ${contextInstruction}

      TASK:
      Create a comprehensive study dashboard overview for this topic.
      1. Write a clear, engaging Summary (Markdown supported).
      2. List 5-7 Key Concepts (Bullet points).
      3. Suggest 3 high-quality YouTube search terms or resource titles that would help study this.
      4. Suggest 3 specific activity modes from this app (Quiz, Flashcards, FRQ, Lab) that fit this topic best.

      OUTPUT JSON:
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                query: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["video", "article"] },
              },
              required: ["title", "query", "type"]
            }
          },
          suggestedActivities: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "keyPoints", "resources"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    return {
      summary: result.summary || "Welcome to your study session.",
      keyPoints: result.keyPoints || [],
      resources: result.resources || [],
      uploadedContext: uploadedContext || undefined,
      suggestedActivities: result.suggestedActivities || []
    };

  } catch (err) {
    console.error("Topic Overview Generation Failed:", err);
    return {
      summary: "We could not generate a custom overview at this time. Please use the practice tools below.",
      keyPoints: ["Check your internet connection", "Try refreshing the page"],
      resources: [],
      uploadedContext: uploadedContext
    };
  }
};

export const getMultiModeReport = async (
  course: CourseType,
  topic: string,
  activityLog: { type: string; details?: string; score?: string }[],
  partnerState?: { explanationChat: ChatMessage[]; calculationChat: ChatMessage[] }
): Promise<string> => {
  try {
    const ctx = getCourseContext(course);
    const logSummary = activityLog.length > 0
      ? activityLog.map(a => `- ${a.type}: ${a.details || ''} (Score: ${a.score || 'N/A'})`).join('\n')
      : "No formal activities completed.";

    let partnerSummary = "";
    if (partnerState) {
      if (partnerState.explanationChat.length > 0) {
        partnerSummary += "\n\nEXPLANATION PARTNER CHAT LOG:\n" + partnerState.explanationChat.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
      }
      if (partnerState.calculationChat.length > 0) {
        partnerSummary += "\n\nCALCULATION PARTNER CHAT LOG:\n" + partnerState.calculationChat.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
      }
    }

    const prompt = `
      ${ctx.role}
      Topic: ${topic}

      SESSION LOG:
      ${logSummary}
      ${partnerSummary}

      TASK:
      Write a friendly, encouraging closing report for the student's study session.

      GUIDELINES:
      1. Mention specific activities they did (scores, etc).
      2. If they chatted with the Explanation/Calculation Partners, specifically mention what they asked about and praise their curiosity.
      3. Suggest one next step (e.g. "Try a harder quiz next time" or "Review the flashcards").
      4. Keep it brief (4-6 sentences).
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "text/plain"
    });

    return response.text || "Great job on your study session!";

  } catch (err) {
    return "Session completed. Great work!";
  }
};
