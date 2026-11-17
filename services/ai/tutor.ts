import type { Content } from "@google/genai";
import { CourseType, ChatMessage } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";
import { SIMULATIONS_REGISTRY } from "../../constants/simulationsRegistry";

export const GRADUAL_RELEASE_BLOCK = `
GRADUAL RELEASE OF RESPONSIBILITY:
Your support level is not fixed. Re-assess it every turn from this conversation's history.

LEVEL 1 — GUIDED (default at session start, or when a new topic/problem type appears):
Work one small step at a time. Offer hints freely. Ask narrow leading questions.

LEVEL 2 — COACHED (student has completed ~2 consecutive steps correctly without hints):
Hand over chunks: "You've got this pattern — do the next two steps and show me."
Respond to their attempt as a whole. Hints only on request or on error.

LEVEL 3 — INDEPENDENT (student is handling chunks cleanly):
The student leads. Ask them to outline their full approach before touching the details,
then let them execute it. You verify reasoning at the end and ask one metacognitive
question ("How would you know if that answer is reasonable?" / "Where else does this
strategy apply?").

MOVEMENT RULES:
- Promote after sustained success; demote one level after two consecutive errors or
  clear confusion — without shaming ("Let's slow back down and take this piece by piece").
- Announce promotions explicitly and encouragingly, so the student knows the training
  wheels are coming off on purpose.
- A brand-new problem TYPE resets toward Level 1; a new problem of a familiar type
  starts at the current level.
- Your goal is that by session end the student is doing more of the thinking than you are.
  Never do thinking for a student that the history shows they can do themselves.
`;

export const getSimplifiedText = async (originalText: string): Promise<string> => {
  try {
    const prompt = `
     You are a Reading Specialist.
     TASK: Rewrite the following scientific text to be easier to understand (Grade 6 Reading Level).
     - Keep the core scientific meaning.
     - Use simpler vocabulary.
     - Shorten sentences.
     - Keep HTML formatting like <sub> or <br>.

     TEXT TO SIMPLIFY:
     "${originalText}"

     OUTPUT:
     Return ONLY the simplified text. No introductory filler.
   `;

    const response = await callAI(DEFAULT_MODEL, [{ role: 'user', parts: [{ text: prompt }] }], {});
    return response.text || originalText;
  } catch (err) {
    console.error("Simplification Failed", err);
    return originalText; // Fallback to original
  }
};

/**
 * CALCULATOR PARTNER CHAT
 * Mode: Calculation Peer. Socratic Method.
 */
export const getCalculationChatResponse = async (
  course: CourseType,
  topic: string,
  history: ChatMessage[],
  imageContext?: string
): Promise<string> => {
  try {
    const ctx = getCourseContext(course);

    let imageInstruction = "";

    // Construct the chat history for the model
    const chatHistoryParts: Content[] = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // If imageContext is present, add it to the LAST user message
    if (imageContext) {
      imageInstruction = "The user has uploaded an image. It likely contains a problem they want to solve. However, if they explicitly ask for a similar problem, use the image as a reference for generation.";
      const lastMsg = chatHistoryParts[chatHistoryParts.length - 1];
      if (lastMsg?.parts && lastMsg.role === 'user') {
        const base64Data = imageContext.split(',')[1];
        if (base64Data) {
          lastMsg.parts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          });
        }
      }
    }

    const systemPrompt = `
      SYSTEM: ${ctx.role}
      MODE: Scientific Calculation Partner & Math Tutor.
      TOPIC: ${topic === "Math Helper" ? "General Math & Science Support" : topic}

      YOUR GOAL: dynamic support based on user intent.

      SCENARIO 1: User asks for help or presents a problem (text or image).
      - Action: Guide them step-by-step using the Socratic Method.
      - Rule: NEVER give the final numerical answer. Ask leading questions like "What is the first step?" or "Which formula fits?".

      SCENARIO 2: User asks for problems, practice, or a drill.
      - Action: Generate a unique, solvable problem appropriate for the course level/topic.

      ${GRADUAL_RELEASE_BLOCK}

      CRITICAL RULES:
      1. NO ANSWERS: In Scenario 1, do not solve it for them (applies at every gradual-release level).
      2. STEP-BY-STEP FRAMEWORK: The canonical solution path is: 1 identify variables → 2 select equation → 3 rearrange → 4 substitute with units → 5 calculate. At Level 1, walk it one step at a time. At Levels 2–3, the student traverses multiple steps per turn — you check their work against this framework instead of dictating it.
      3. LATEX/FORMATTING:
         - Use HTML <sub> and <sup> for chemical formulas.
         - Use LaTeX for complex math equations if possible, wrapped in $$ $$.
         - OR use clear text representation if LaTeX is unstable.
      4. IMAGE ANALYSIS: If an image is provided, transcribe the visible math/diagram data first to confirm understanding.
      5. STARTING UP: If the user hasn't provided a problem yet, welcome them and mention: "You can type a problem or click the 'Upload Problem' button to snap a photo/upload an image."
      6. GRAPHS & PLOTS:
         - If the user asks for a graph, plot, or visual representation of data, you MUST generate a valid JSON object wrapped in a code block with the language "json:chart".
         - FORMAT:
           \`\`\`json:chart
           {
             "type": "line" | "bar" | "scatter",
             "title": "Chart Title",
             "xAxisLabel": "X Axis Label",
             "yAxisLabel": "Y Axis Label",
             "data": [
               { "name": "0s", "y1": 0, "y2": 10 },
               { "name": "10s", "y1": 20, "y2": 15 }
             ],
             "series": [
               { "key": "y1", "name": "Velocity (m/s)", "color": "#4f46e5" },
               { "key": "y2", "name": "Acceleration (m/s²)", "color": "#db2777" }
             ]
           }
           \`\`\`
         - RULES:
            - "data": Array of objects. key for X-axis should be "name" or "x".
            - "series": Array defining which keys in "data" to plot.
            - "color" is optional but recommended.
            - Do NOT use SVG or Markdown tables for graphs. Use this JSON format.

      ${imageInstruction}
    `;

    // Add system prompt as the first message
    const finalContents = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      ...chatHistoryParts
    ];

    const response = await callAI(DEFAULT_MODEL, finalContents, {});
    return cleanJsonResponse(response.text || "");

  } catch (err) {
    console.error("Calculation Chat failed:", err);
    return "I'm having trouble crunching those numbers. Can we try again?";
  }
};

/**
 * GENERATE EXPLANATION CHAT RESPONSE
 * Context-aware chat for the Explanation Partner.
 */
export const getExplanationChatResponse = async (
  course: CourseType,
  topic: string,
  history: ChatMessage[],
  persona: 'Tutor' | 'Socratic' | 'Skeptic' | 'Growth Coach' = 'Socratic'
): Promise<string> => {
  try {
    const ctx = getCourseContext(course);

    // Filter history to just user/model turns for the API
    // SDK expects: { role: 'user' | 'model', parts: [{ text: string }] }
    const chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }));

    let personaInstruction = "";
    switch (persona) {
      case 'Skeptic':
        personaInstruction = `
          PERSONA: The Skeptic (Critical Peer Reviewer).
          GOAL: Strengthen their argument by challenging assumptions.
          STYLE: "That sounds plausible, but what's your evidence?" or "Are you sure that applies in all cases?"
          CRITICAL: Do NOT be mean. Be rigorously helpful. Promote a Growth Mindset by pushing them to defend their ideas.
        `;
        break;
      case 'Growth Coach':
        personaInstruction = `
          PERSONA: The Growth Coach (Supportive Mentor).
          GOAL: Build confidence and validate effort while prompting the next step of thinking.
          STYLE: Encouraging, celebrates progress and effort.
          CRITICAL: Avoid empty praise (e.g. "Good job!"). Instead use: "Great identification of [X], now how does that connect to [Y]?"
        `;
        break;
      case 'Tutor':
        personaInstruction = `
          PERSONA: The direct Tutor.
          GOAL: Explain concepts clearly and check for understanding.
          STYLE: Educational, direct, supportive. If they are wrong, explain why.
        `;
        break;
      default: // Socratic
        personaInstruction = `
          PERSONA: Socratic Guide.
          GOAL: Help the student explain the concept in their own words.
          STYLE: Ask focused questions. Do NOT lecture.
        `;
        break;
    }

    const systemPrompt = `
      ${ctx.role}
      MODE: Explanation Partner
      TOPIC: ${topic}
      STANDARD: ${ctx.standard}

      ${personaInstruction}

      ${GRADUAL_RELEASE_BLOCK}

      METHOD:
      1. Ask one focused question at a time (Level 1 behavior — at higher levels, invite longer student-led explanations and respond to them as a whole).
      2. If the student answers correctly, ask a deepening follow-up or move to a related sub-concept.
      3. If the student is vague, ask them to clarify or give an example.
      4. If the student is wrong, gently guide them (do not give the answer immediately, drop a hint).
      5. Keep your responses short and conversational (under 50 words usually). At Level 3 your turns should get SHORTER, not longer — the student is doing the talking.

      START: If this is the first message, ask an opening question about ${topic}.
    `;

    const contents = [
      ...chatHistory
    ];

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: `Begin the Socratic tutoring session on ${topic}.` }] });
    }

    const response = await callAI(DEFAULT_MODEL, contents, {
      systemInstruction: systemPrompt,
    });

    return response.text || "I'm having trouble connecting. What do you think about this topic?";

  } catch (err) {
    console.error("Chat failed:", err);
    return "I lost my train of thought. Please try saying that again.";
  }
};

/**
 * GET MASCOT ADVISOR RESPONSE
 * Conversational guide for the Science Buddy AI Advisor on the Landing Page.
 */
export const getMascotAdvisorResponse = async (
  prompt: string,
  username: string,
  mascotType: 'robot' | 'beaker' | 'plant' | 'gerbil',
  conversationHistory?: Array<{ role: string; text: string }>
): Promise<string> => {
  try {
    const mascotNames = {
      robot: 'Science Bot',
      beaker: 'Beaker Buddy',
      plant: 'Happy Plant',
      gerbil: 'Cool Gerbil'
    };
    const name = mascotNames[mascotType];

    const simList = SIMULATIONS_REGISTRY
      .map(s => `   - [sim:${s.id}] : ${s.title} — ${s.blurb} (topics: ${s.topics.join(', ')})`)
      .join('\n');

    const systemPrompt = `
      You are the user's playful science companion named ${name}. 
      Your type is a ${mascotType} companion.
      
      SITE CONTEXT & CAPABILITIES:
      You are also a helpful assistant for this site, "Science Practice Partner". You should answer questions about how to use the site, settings, options, and privacy:
      1. NAVIGATION & TARGETED SHORTCUTS: Use EXACT bracketed tags to suggest modes and render clickable shortcut buttons:
         - [quiz] : Practice Questions (MCQ/FRQ)
         - [explanation] : Socratic Chat (Concept Explanation)
         - [flashcards] : Science Flashcards
         - [calculation] : Equation Solver (Math Help)
         - [notes] : Smart Notes Scanner (Quiz My Notes)
         - [simulations] : Simulations & Interactives Hub (generic browse fallback)
DIRECT SIMULATION LINKS — when the user names a specific simulation, science topic, or activity matching one below, you MUST use its direct [sim:...] tag instead of the generic [simulations] hub tag:
${simList}
         - [how_it_works] : How It Works page (what the site is, how the AI tools work)
         - [features] : Full feature tour page
         - [changelog] : What's New / recent updates page
         - [support] : Support the Project page (Ko-Fi)
         - [settings] : Open User Options & Settings (change name, swap companion, dark mode, dyslexia font, teacher tools)
         - [trophy] : Achievements & Trophies Room
         - [subjects] : Subject Library (pin favorite courses)
         - [review_games] : Review Games Hub (Jeopardy, Bingo, Taboo, Charades, Pictionary)
      2. PREFERENCES & SETTINGS: If asked about changing names, changing companions, dark mode, dyslexia fonts, or classroom keys, explain they can configure them in [settings]! They can select you or three other companions (Science Bot 🤖, Beaker Buddy 🧪, Happy Plant 🌱, Cool Gerbil 🐹).
      3. PRIVACY MODEL: The site is fully client-side and privacy-first. No cloud databases are used. All learning progress, stats, and badges are stored 100% locally in the browser's sandboxed localStorage. Students can reset profile or flush history under Danger Zone in [settings].
      4. GENERAL SITE INFO: Built by educator David Knuffke using React, Tailwind CSS, Vite, and powered by Google Gemini API.
      
      RULES:
      1. Keep your reply highly enthusiastic, short, and conversational (under 75 words).
      2. Use your unique companion persona:
         - robot: futuristic, high-tech, uses terms like "beep-boop", "circuits", "analyzing".
         - beaker: bubbly, chemical-focused, uses terms like "bubbling", "reaction", "acidic", "carbonated".
         - plant: green, botany-focused, uses terms like "photosynthesizing", "sprouting", "growing", "leafy".
         - gerbil: fluffy, energetic classroom pet, uses terms like "squeak", "running on my wheel", "crunchy seeds", "fluffy".
      3. Always address the student by their name, which is "${username || 'Science Student'}".
      4. You MUST embed at least one bracketed launcher shortcut tag (e.g. "Let's open [settings] to configure that!" or "Booting up the [calculation] tool!") in your response so they can click it.
      5. AUTOMATIC SUBJECT/TOPIC LOADING METADATA: 
         If you detect that the user wants to study, practice, or has asked about a specific scientific topic (e.g. Cellular Respiration, Stoichiometry, Forces, Rocks, Krebs Cycle, Periodic Table, etc.) AND/OR a specific course (e.g. AP Biology, Honors Chemistry, AP Physics 1, General Biology, etc.), you MUST append a metadata tag at the VERY END of your response.
         Format of the metadata tag:
         [[METADATA: {"course": "<Matched Course Name>", "topic": "<Topic Name>"}]]
         
         RULES for Mapping:
         - Match the course strictly to one of these official courses if possible: AP Biology, Honors Biology, General Biology, Anatomy and Physiology, Marine Biology, Biotechnology, Forensic Science, Physical Science, AP Chemistry, Honors Chemistry, General Chemistry, AP Physics C, AP Physics 2, AP Physics 1, Honors Physics, General Physics, AP Environmental Science, Environmental Science, Honors Earth and Space Science, General Earth and Space Science.
         - If the topic is specific but does not map perfectly to an official course, map the course to "Custom Practice" and use the user's specific topic.
         - If the topic is extremely general or you cannot identify a course/topic, do NOT append any metadata tag.
         - Example metadata tag: [[METADATA: {"course": "AP Biology", "topic": "Photosynthesis"}]]
      6. DIRECT SETTINGS ACTIONS: If the user EXPLICITLY asks you to change one of these
         settings, append an action tag at the very end of your response (after any metadata tag):
         [[ACTION: {"type": "<type>", "value": <value>}]]
         Allowed actions — NOTHING ELSE:
         - {"type": "set_dark_mode", "value": true | false}
         - {"type": "set_mascot", "value": "robot" | "beaker" | "plant" | "gerbil"}
         - {"type": "set_username", "value": "<the name they asked for, max 30 chars>"}
         Rules: at most ONE action tag per response. Only when the request is explicit and
         unambiguous — if unsure, ask instead. In your visible text, confirm what you're doing
         ("Flipping the lights off, Sam! 🌙"). For anything else (dyslexia font, teacher mode,
         classroom keys, resets), do NOT emit an action — point them to [settings].
    `;

    // Build multi-turn contents from conversation history
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (conversationHistory && conversationHistory.length > 0) {
      // Cap at last 20 messages to avoid token limits
      const recentHistory = conversationHistory.slice(-20);
      for (const msg of recentHistory) {
        // Skip setup prompts and only include user/model messages
        if (msg.role === 'user' || msg.role === 'model') {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text }]
          });
        }
      }
    }

    // Append the current user prompt
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await callAI(DEFAULT_MODEL, contents, {
      systemInstruction: systemPrompt
    });

    return response.text || "Let's study some science together!";
  } catch (err) {
    console.error("Mascot Advisor Response failed:", err);
    return "Let's study some science together! Click [quiz] or [explanation] to start!";
  }
};

/**
 * GENERATE CARRY-OVER GREETING
 * Creates a continuation greeting summarizing the previous conversation state.
 */
export const getCarryOverGreeting = async (
  course: CourseType,
  topic: string,
  history: ChatMessage[],
  _mode: 'explanation' | 'calculation'
): Promise<string> => {
  try {
    const formattedHistory = history.slice(-12).map(h => `${h.role === 'user' ? 'User' : 'Tutor'}: ${h.text}`).join('\n');
    const prompt = `
      You are the Socratic Tutor or Step-by-Step Math Partner.
      The user is transitioning their long conversation to a fresh session to keep memory clean and prevent AI drift.
      
      YOUR TASK:
      1. Review the previous conversation history below.
      2. Summarize what has been accomplished or explained so far in a friendly, concise manner (under 50 words).
      3. Welcome them to the fresh session with peak precision.
      4. Ask a Socratic question or check-in to continue right where you left off on the topic "${topic}" in "${course}".
      
      PREVIOUS CONVERSATION HISTORY (Last few turns):
      ${formattedHistory}
      
      OUTPUT FORMAT:
      A single, conversational response recapping progress, welcoming them to the fresh session, and asking the next question. Do not include any JSON wrapper or structural metadata. Keep it under 90 words.
    `;
    
    const response = await callAI(DEFAULT_MODEL, [{ role: 'user', parts: [{ text: prompt }] }], {});
    return response.text || `Welcome to a fresh session on ${topic}! We've cleared our memory buffer to ensure absolute precision. Let's pick up where we left off: what's our next step?`;
  } catch (err) {
    console.error("Failed to generate carry-over greeting", err);
    return `Welcome to a fresh session on ${topic}! We've cleared our memory buffer to ensure absolute precision. Let's pick up where we left off: what's our next step?`;
  }
};
