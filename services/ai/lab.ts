import { CourseType, ChatMessage, LabTrack } from "../../types";
import { callAI, DEFAULT_MODEL } from "./core";

export const getLabAssistance = async (
  track: LabTrack,
  history: ChatMessage[],
  projectContext: string = "",
  dataString: string = "",
  course: CourseType = 'General Biology',
  includeVisuals: boolean = false
) => {
  try {
    // Dynamic System Prompt based on Track
    let systemPrompt = "";
    const baseContext = `You are a Lab Co-Pilot for a ${course} student. Your goal is to be helpful, concise, and scientifically accurate.`;

    switch (track) {
      case 'design':
        systemPrompt = `${baseContext}
          MODE: Experimental Design.
          TASK: Help the student brainstorm research questions, variables (IV/DV/Controls), and procedures.
          STYLE: Socratic. Ask guiding questions to help them refine their ideas. Do not just give them the answers.
          CRITICAL: Be concise. Use bullet points. Avoid walls of text.`;
        break;
      case 'analysis':
        systemPrompt = `${baseContext}
          MODE: Data Analysis.
          TASK: Help the student interpret their data, calculate statistics, or identify trends.
          INPUT DATA: The user may provide raw data in CSV or text format below.
          STYLE: Analytical. Explain *how* to calculate or interpret, don't just give the number if it's a learning moment.
          CRITICAL: Prefer CSV format for data. Be concise.`;
        break;
      case 'feedback':
        systemPrompt = `${baseContext}
          MODE: Report Feedback.
          TASK: Critique the student's scientific argument or writing.
          STYLE: Constructive. Point out strengths and specific areas for improvement (logic, evidence, clarity).
          IMPORTANT: If the user specifically asks for C.E.R. (Claim-Evidence-Reasoning), use that framework. Otherwise, provide general scientific feedback.
          CRITICAL: Be concise. Use bullet points.`;
        break;
      case 'errors': {
        const visualInstruction = includeVisuals
          ? "VISUALS: If the student describes a troubleshooting scenario, generate a Mermaid.js 'graph TD' decision tree (using ```mermaid code block) to help them isolate the problem (e.g., Yes/No flow)."
          : "VISUALS: Do NOT generate diagrams.";
        systemPrompt = `${baseContext}
          MODE: Error Analysis.
          TASK: Help the student troubleshoot why their experiment failed or gave weird results.
          STYLE: Investigative. Ask about their methods, controls, and potential sources of error (systematic vs random).
          ${visualInstruction}
          CRITICAL: Be concise.`;
        break;
      }
      case 'mentor':
        systemPrompt = `${baseContext}
          MODE: Research Mentor.
          TASK: Act as a long-term project guide. Help with timeline, feasibility, and connecting concepts.
          MEMORY: You have access to the 'Project Context' below. Use it to keep your advice relevant to their specific project.
          CRITICAL: Be concise. Use bullet points.`;
        break;
      case 'safety':
        systemPrompt = `${baseContext}
          MODE: Safety Check.
          TASK: Review the student's proposed experimental protocol for potential safety hazards.
          CRITICAL SAFETY RULE: You are an AI, not a certified safety officer. Always include a disclaimer: "I am an AI. Always check with your instructor before proceeding."
          CHECKLIST:
          1. Chemicals (toxicity, flammability, disposal).
          2. Biological hazards (bacteria, mold, fluids).
          3. Physical hazards (sharps, heat, electricity).
          4. PPE requirements.
          OUTPUT: Provide a bulleted list of "Potential Hazards" and "Recommended Precautions". If the protocol looks safe, say so but still recommend standard PPE.
          CRITICAL: Be concise.`;
        break;
      default:
        systemPrompt = baseContext;
    }

    const lastMessage = history[history.length - 1]?.text || "";

    // Special "Context Generation" Mode
    if (lastMessage.includes("GENERATE_PROJECT_CONTEXT")) {
      systemPrompt = `${baseContext}
          MODE: Context Summarization.
          TASK: Read the provided document/text and summarize it into a concise "Project Context" paragraph (approx 50-100 words).
          GOAL: This summary will be used as the AI's memory for future chats. Capture the Research Question, Hypothesis, Variables, and Key Methods.
          OUTPUT: Just the summary text. No conversational filler.`;
    }

    // Prepare Context Info
    const contextInfo = `
      --- PROJECT CONTEXT (Memory) ---
      ${projectContext || "No context set."}

      --- DATA / FILE CONTENT ---
      ${dataString || "No data provided."}
    `;

    // Construct Messages for API
    const messages = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Inject Context into the latest user message (or system prompt if preferred, but user message is robust)
    // Actually, putting it in System Instruction is cleaner, but let's append to the prompt.
    // Or we use the system instructions feature of the model.
    // The previous implementation used a separate system part.

    const contents = [
      {
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nCONTEXT INFO: ${contextInfo}` }]
      },
      ...messages
    ];

    const response = await callAI(DEFAULT_MODEL, contents, {
      responseMimeType: "text/plain"
    });

    return response.text || "I'm having trouble analyzing that right now.";

  } catch (err) {
    console.error("Lab Assistance Failed:", err);
    return "I'm having trouble helping with that right now. Please try again.";
  }
};
