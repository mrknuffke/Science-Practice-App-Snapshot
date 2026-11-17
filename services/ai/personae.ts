import { CourseType } from '../../types';
import { callAI, getCourseContext, DEFAULT_MODEL } from './core';
import { PersonaId, PersonaChatMessage } from '../../components/personae/personaeTypes';
import { generateOfflineFallbackResponse } from '../../components/personae/personaeEngine';

export interface PersonaCallParams {
  persona: PersonaId;
  course: CourseType;
  topic: string;
  history: PersonaChatMessage[];
  scratchpadContent?: string;
  simplify?: boolean;
}

export async function callPersonaAI(params: PersonaCallParams): Promise<string> {
  const { persona, course, topic, history, scratchpadContent, simplify } = params;
  const ctx = getCourseContext(course);

  const lastUserMsg = [...history].reverse().find(m => m.role === 'user')?.text || '';

  // Persona-specific system prompts
  let personaInstructions = '';
  if (persona === 'tutor') {
    personaInstructions = `
You are the "AI Science Tutor", a patient, direct, step-by-step calculation and conceptual problem-solving partner in ${course} (${topic}).
Key pedagogical instructions:
- Provide clear, sequential, numbered step-by-step explanations.
- Emphasize dimensional analysis, explicit units, formula selection, and arithmetic verification.
- Verify intermediate numbers and point out any algebraic or calculation slips gently.
- Encourage the student to complete the final arithmetic step when appropriate.
- Refer to their working scratchpad when relevant.
`;
  } else if (persona === 'socratic') {
    personaInstructions = `
You are the "AI Socratic Guide", an inquiry-based intellectual sparring partner in ${course} (${topic}).
Key pedagogical instructions:
- DO NOT provide the direct answer or solve the problem for the student.
- Respond with 1 to 2 targeted Socratic questions, counter-examples, or thought experiments.
- Guide the student to examine underlying physical/chemical/biological causes, boundary conditions, or conservation laws.
- Challenge unstated assumptions with gentle curiosity.
- Keep responses concise (under 120 words) to encourage immediate student reflection and dialogue.
`;
  } else {
    // Growth coach
    personaInstructions = `
You are the "AI Growth Coach", an empathetic, metacognitive mentor specializing in science learning and error analysis in ${course} (${topic}).
Key pedagogical instructions:
- Deconstruct student errors using our 4-part taxonomy:
  1. Conceptual Misconception (flawed or intuitive mental model)
  2. Mathematical / Unit Slip (procedural or arithmetic error despite sound understanding)
  3. Prompt Constraint Misread (overlooking "NOT", "EXCEPT", units, or key constraints)
  4. Factual Retrieval Gap (momentary memory blank or confusing homologous terms)
- Frame mistakes as high-leverage data points that reveal exactly where to reinforce neural pathways.
- Provide a concrete, actionable study strategy (e.g. bracketed dimensional analysis, contrasting flashcards, qualifier highlighting).
- Always include an affirming growth mindset takeaway emphasizing neuroplasticity and the power of "not yet".
`;
  }

  const simplifyDirective = simplify
    ? `\nIMPORTANT: The student has requested a SIMPLIFIED explanation. Explain the concept using clear, everyday analogies and simple language suitable for a middle-school student. Avoid dense academic jargon.\n`
    : '';

  const scratchpadContext = scratchpadContent && scratchpadContent.trim()
    ? `\nSTUDENT'S WORKING SCRATCHPAD:\n\`\`\`\n${scratchpadContent.trim()}\n\`\`\`\n`
    : '';

  // Build conversation transcript for multi-turn context
  const conversationTranscript = history
    .slice(-8)
    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor/Guide'}: ${m.text}`)
    .join('\n\n');

  const prompt = `
${ctx.role}
${personaInstructions}
${simplifyDirective}
${scratchpadContext}

CONVERSATION HISTORY:
${conversationTranscript}

STRICT WRITING RULES:
- Do not use em-dashes (— or –) anywhere in your response. Use hyphens (-), colons, commas, or parentheses instead.
- Use markdown formatting with bolding, lists, and code blocks for formulas where helpful.
- Be encouraging, precise, and scientifically rigorous.

Provide your response now:
`;

  try {
    const raw = await callAI(DEFAULT_MODEL, prompt, {
      temperature: persona === 'socratic' ? 0.7 : 0.4,
    });

    const responseText = (typeof raw === 'string' ? raw : raw?.text) || '';

    if (!responseText.trim()) {
      return generateOfflineFallbackResponse(persona, course, topic, lastUserMsg);
    }

    // Strip any unexpected em-dashes from AI output
    return responseText.replace(/[—–]/g, '-').trim();
  } catch (error) {
    console.warn(`[callPersonaAI] AI request failed, utilizing heuristic fallback:`, error);
    return generateOfflineFallbackResponse(persona, course, topic, lastUserMsg);
  }
}
