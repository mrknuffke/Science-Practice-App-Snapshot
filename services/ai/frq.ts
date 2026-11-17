import { Type } from "@google/genai";
import { CourseType, Question, DataExhibit } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";

/**
 * GENERATE FREE RESPONSE QUESTION (FRQ)
 * Complex task: Uses DEFAULT_MODEL for experimental design reasoning.
 * Switched to Flash to avoid timeout and ensure schema compliance.
 */
export const getFRQQuestion = async (
  course: CourseType,
  topics: string | string[], // UPDATED: Accept both single topic and array
  difficulty: 'Easy' | 'Medium' | 'Hard',
  _seedQuestions: string[] = [],
  questionStyle: 'Standard' | 'Data Analysis' | 'Visuals' | 'Experimental Design' | 'Scenario Analysis' = 'Standard'
): Promise<Question> => {
  try {
    const ctx = getCourseContext(course);

    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];
    const topicString = topicArray.join(', ');

    // Build topic instruction
    let topicInstruction = '';
    if (topicArray.length > 1) {
      topicInstruction = `Topics: "${topicString}"\n\nIMPORTANT: Generate a question that synthesizes concepts from these topics. Indicate which topic is the primary focus in the "topic" field.`;
    } else if (topicArray[0] === "General Review") {
      topicInstruction = `Topic: Comprehensive Synthesis Question covering multiple units of ${course}.`;
    } else {
      topicInstruction = `Topic: "${topicArray[0]}"`;
    }

    const isElementary = course.includes("Elementary");
    const isMiddleSchool = course.includes("Middle School");

    // Dynamic prompt injection based on style
    let styleInstruction = "";

    // Override/Simplify for younger students
    if (isElementary) {
      styleInstruction = `
        TARGET AUDIENCE: Elementary School Students (Grades 3-5).
        - Use very simple vocabulary.
        - Focus on basic observation (What do you see?), simple cause-and-effect, or drawing a picture (describing it).
        - DO NOT ask for complex experimental design or detailed chemical mechanisms.
        - If 'Visuals' is selected, describe a simple picture (like a plant or animal).
        - If 'Data Analysis' is selected, use a very simple table (e.g., number of seeds).
      `;
    } else if (isMiddleSchool) {
      styleInstruction = `
        TARGET AUDIENCE: Middle School Students (Grades 6-8).
        - Use clear, accessible vocabulary.
        - Focus on applying concepts to real-world examples.
        - Scaffolding: Break down complex tasks into simpler steps.
      `;
    } else {
      // High School / AP Logic
      switch (questionStyle) {
        case 'Data Analysis':
          styleInstruction = `
            MANDATORY: This question MUST include a data table or graph description.
            - Incorporate a markdown table with experimental data related to the topic.
            - Ask the student to analyze trends, calculate rates, or explain the data.
            - YOU MUST GENERATE A "SCENARIO" FIELD containing this data context.
          `;
          break;
        case 'Experimental Design':
          styleInstruction = `
            MANDATORY: This question must focus of experimental design.
            - Ask the student to propose a hypothesis, identify variables, or critique a procedure.
            - The scenario should describe a research problem or observation.
          `;
          break;
        case 'Visuals':
          styleInstruction = `
            MANDATORY: This question requires visual analysis.
            - Describe a diagram, cell structure, or pathway in the "Scenario" field.
            - Ask questions that reference specific parts of this description.
            - (Since we are text-based, write a vivid description of the visual).
          `;
          break;
        case 'Scenario Analysis':
          styleInstruction = `
            MANDATORY: Provide a real-world case study or application.
            - Connect the scientific concept to a medical, environmental, or industrial scenario.
            - Ask the student to apply their knowledge to solve a specific problem in this context.
          `;
          break;
        default:
          styleInstruction = "Standard conceptual application question.";
      }
    }

    const prompt = `
      ${ctx.role}
      Course: ${course}
      ${topicInstruction}
      Standard: ${ctx.standard}
      Difficulty: ${difficulty}
      Question Style: ${questionStyle}
      ${styleInstruction}

      TASK:
      Generate ONE high-quality AP-style Free Response Question (FRQ).

      REQUIREMENTS:
      1. Scenario: Provide a detailed scientific scenario, experiment, or description.
      2. MULTI-MODAL DATA (Exhibits):
         - Provide 1 or 2 exhibits (Data Table, Graph, or Diagram) that are CRITICAL to answering the question.
         - For DIAGRAMS/VISUALS (if requested):
            - Set type to 'text'.
            - In 'content', provide a Mermaid.js diagram definition wrapped in \`\`\`mermaid code blocks.
            - Example:
              \`\`\`mermaid
              graph TD;
                A[DNA] --> B[RNA];
              \`\`\`
            - Do NOT use the chartData field for diagrams.
            - Valid Mermaid types: graph TD/LR, sequenceDiagram, flowChart.
         - For TABLES:
            - Set type to 'table'.
            - Use HTML format (class="frq-table") in 'content'.
         - For GRAPHS (Numerical Data):
            - Set type to 'graph'. Leave content empty string.
            - YOU MUST PROVIDE STRUCTURED JSON DATA in the 'chartData' field.
          - GRAPH RULES:
             a) Populate 'chartData'.
             b) FOR SCATTER PLOTS: keys MUST be "x" and "y" (e.g. [{"x": 1, "y": 2}]).
             c) FOR BAR/LINE: Use "name" for X-axis categories (e.g. [{"name": "Time", "val": 10}]).
          - CRITICAL: Provide a CAPTION for each exhibit.
      3. Questions: Break the FRQ into 3-4 distinct sub-questions (e.g., (a), (b), (c), (d)).
      4. Bold the action verbs (Identify, Describe, Explain, Calculate, Justify, Predict) using HTML <b> tags.
      5. Use HTML tags for scientific notation.

      OUTPUT FORMAT:
      Return a JSON object with:
      - type: "frq"
      - options: [] (Empty array)
      - scenario: string (The introductory text)
      - exhibits: Array of { title, type, content, caption, chartData }
        - Note: The 'title' field should ONLY contain the descriptive name.
      - parts: string[] (The list of sub-questions)
    `;

    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING, description: "The scenario text" },
          exhibits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Descriptive title ONLY (No 'Figure 1' prefix)" },
                type: { type: Type.STRING, enum: ['table', 'graph', 'text'] },
                content: { type: Type.STRING, description: "HTML table, Mermaid Diagram code (```mermaid...), or empty string (for graphs)" },
                caption: { type: Type.STRING, description: "Explanation of what is shown." },
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
                        description: "Data points. MUST use 'x'/'y' for Scatter, or 'name'/'val' for Bar/Line.",
                        properties: {
                          name: { type: Type.STRING, description: "X-axis Label (Bar/Line)" },
                          x: { type: Type.NUMBER, description: "X Value (Scatter)" },
                          y: { type: Type.NUMBER, description: "Y Value (Scatter)" },
                          val: { type: Type.NUMBER, description: "Y Value (Bar/Line)" },
                          val2: { type: Type.NUMBER, description: "2nd Series Y Value" }
                        }
                      }
                    },
                    series: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING, description: "Must match a key in data object (e.g. 'val', 'y', 'val2')" },
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
          },
          parts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of sub-questions" },
          type: { type: Type.STRING, enum: ["frq"] },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["scenario", "parts", "type", "options"]
      }
    });

    const cleanText = cleanJsonResponse(response.text || "");
    const result = JSON.parse(cleanText || "{}");

    // Fallback text logic for legacy views that don't support exhibits
    const exhibitsHtml = (result.exhibits || []).map((e: DataExhibit) =>
      `<div class='exhibit'><strong>${e.title}</strong><br/>${e.content}<br/><em>${e.caption || ''}</em></div>`
    ).join('<br/>');

    const fallbackText = `<div class='frq-container'><div class='frq-scenario'>${result.scenario || ''}</div>${exhibitsHtml}<ol type='a' class='frq-list'>${(result.parts || []).map((p: string) => `<li>${p}</li>`).join('')}</ol></div>`;

    return {
      ...result,
      text: fallbackText, // Fallback for backward compatibility
      scenario: result.scenario,
      exhibits: result.exhibits || [],
      subQuestions: result.parts,
      id: `frq-${Date.now()}`,
      unit: "",
      topic: result.topic || topicArray[0], // Use AI-provided topic or first from array
      options: []
    };
  } catch (err) {
    console.error("FRQ generation failed:", err);
    throw err;
  }
};
