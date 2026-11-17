import { Type } from "@google/genai";
import { CourseType, Question } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

/**
 * GENERATE C.E.R. (CLAIM, EVIDENCE, REASONING) QUESTION
 * Complex task: Uses DEFAULT_MODEL for scientific synthesis.
 */
export const getCERQuestion = async (
  course: CourseType,
  topics: string | string[], // UPDATED: Accept both single topic and array
  difficulty: 'Easy' | 'Medium' | 'Hard',
  _seedQuestions: string[] = []
): Promise<Question> => {
  try {
    const ctx = getCourseContext(course);

    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];
    const topicString = topicArray.join(', ');

    // Build topic instruction
    let topicInstruction = '';
    if (topicArray.length > 1) {
      topicInstruction = `Topics: "${topicString}"\n\nIMPORTANT: Generate a data analysis scenario that draws from these topics. Indicate which topic is the primary focus in the "topic" field.`;
    } else if (topicArray[0] === "General Review") {
      topicInstruction = `Topic: Comprehensive Data Analysis covering ${course}.`;
    } else {
      topicInstruction = `Topic: "${topicArray[0]}"`;
    }

    const prompt = `
      ${ctx.role}
      Course: ${course}
      ${topicInstruction}
      Mode: Multi-Modal Data Analysis (CER)
      Difficulty: ${difficulty}

      TASK:
      Generate a robust data analysis scenario for a Claim, Evidence, Reasoning (CER) practice session.

      REQUIREMENTS:
      1. Context: Provide a brief scientific introduction/context.
      2. COMPLEX DATA: You MUST provide TWO distinct pieces of evidence (Exhibits):
         - Table 1: A Data Table (formatted as HTML table class="frq-table").
         - Figure 1: A Graph/Chart (Structured JSON Data).
         - GRAPH RULES:
            a) For the Graph, set type to 'graph'.
            b) You MUST provide the 'chartData' field with the following structure:
               {
                 "type": "line" | "bar" | "scatter",
                 "title": "Chart Title",
                 "xAxisLabel": "X Label",
                 "yAxisLabel": "Y Label",
                 "data": [{"name": "0s", "y1": 10, "y2": 5}, {"name": "10s", "y1": 20, "y2": 15}, ...],
                 "series": [
                    {"key": "y1", "name": "Control", "color": "#4f46e5"},
                    {"key": "y2", "name": "Experimental", "color": "#db2777"}
                 ]
               }
             c) SELECTION RULES:
                - CATEGORICAL COMPARISON (e.g. Treatment A vs B) -> Use 'bar'.
                - CONTINUOUS TREND (e.g. Time 0-60s) -> Use 'line'.
                - CORRELATION -> Use 'scatter'.
             d) MULTI-SERIES REQUIREMENT:
                - If the scenario compares two conditions (e.g. "Control" and "Experimental"), you MUST include TWO separate series.
                - Do NOT combine them into one line.
                - In the 'data' array, use keys like "y1" and "y2" for each point.
                - Example Data: [{"name": "1min", "y1": 5, "y2": 10}, {"name": "2min", "y1": 8, "y2": 15}]
                - Example Series: [{"key": "y1", "name": "Control"}, {"key": "y2", "name": "Experimental"}]
         - CRITICAL: Provide a CAPTION for each exhibit explaining what is shown.
      3. Central Question: Ask ONE specific scientific question that REQUIRES synthesis. The student MUST use data from BOTH "Table 1" and "Figure 1" to answer it.
         - **IMPORTANT**: Refer to the data as "Table 1" and "Figure 1". NEVER use "Exhibit A" or "Exhibit B".

      OUTPUT FORMAT (JSON):
      - scenarioContext: string (Intro text)
      - centralQuestion: string
      - exhibits: Array of objects { title: string, type: 'table' | 'graph', content: string, caption: string, chartData?: object }
        - Note: The 'title' field should ONLY contain the descriptive name.
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenarioContext: { type: Type.STRING },
          centralQuestion: { type: Type.STRING },
          exhibits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Descriptive title ONLY" },
                type: { type: Type.STRING, enum: ['table', 'graph', 'text'] },
                content: { type: Type.STRING, description: "HTML table or empty string for graph" },
                caption: { type: Type.STRING, description: "Description of data shown" },
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
                          name: { type: Type.STRING }, // X-axis label
                          x: { type: Type.STRING },
                          y: { type: Type.NUMBER },     // Single series
                          y1: { type: Type.NUMBER },    // Multi-series 1
                          y2: { type: Type.NUMBER },    // Multi-series 2
                          y3: { type: Type.NUMBER },    // Multi-series 3
                          control: { type: Type.NUMBER },
                          experimental: { type: Type.NUMBER }
                        }
                      }
                    },
                    series: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING },
                          name: { type: Type.STRING },
                          color: { type: Type.STRING }
                        },
                        required: ["key", "name"]
                      }
                    }
                  },
                  required: ["type", "title", "xAxisLabel", "yAxisLabel", "data", "series"]
                }
              },
              required: ["title", "type", "content", "caption"]
            }
          }
        },
        required: ["scenarioContext", "centralQuestion", "exhibits"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    return {
      id: `cer-${Date.now()}`,
      text: result.centralQuestion,
      scenario: result.scenarioContext,
      exhibits: result.exhibits || [],
      unit: "",
      topic: result.topic || topicArray[0], // Use AI-provided topic or first from array
      type: 'cer',
      options: []
    };
  } catch (err) {
    console.error("CER generation failed:", err);
    throw err;
  }
};
