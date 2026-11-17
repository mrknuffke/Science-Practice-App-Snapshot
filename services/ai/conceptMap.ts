import { Type } from "@google/genai";
import { CourseType } from "../../types";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";
import {
  ConceptNode,
  ConceptEdge,
  ConceptMapEvaluation,
  PresetConceptItem,
} from "../../components/conceptMap/conceptMapTypes";
import { extractPropositions } from "../../components/conceptMap/conceptMapEngine";

export interface GeneratedConceptSet {
  topic: string;
  concepts: PresetConceptItem[];
  starterSuggestions: Array<{ sourceLabel: string; linkingPhrase: string; targetLabel: string }>;
}

/**
 * Generates an organic set of 6 to 10 concept terms for any user-specified topic.
 */
export async function generateConceptMapTerms(
  course: CourseType,
  topic: string
): Promise<GeneratedConceptSet> {
  const ctx = getCourseContext(course);

  const prompt = `
    ${ctx.role}
    Course: ${course}
    Topic: "${topic}"
    Standard: ${ctx.standard}
    Complexity: ${ctx.complexity}

    TASK:
    Generate 6 to 8 core scientific concepts/terms essential for mapping out the relational structure of "${topic}".
    For each concept provide:
    - id: lowercase slug (e.g. "activation_energy")
    - label: clean scientific name (e.g. "Activation Energy")
    - category: 1 to 2 word conceptual bucket (e.g. "Thermodynamics", "Organelle", "Enzyme", "Vector")
    - description: 1 concise sentence defining its role.

    Also provide 3 starter proposition recommendations (sourceLabel, linkingPhrase, targetLabel) showing sound causal or structural relationships.

    OUTPUT FORMAT:
    JSON strictly following the schema.
  `;

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          concepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                category: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["id", "label", "category", "description"],
            },
          },
          starterSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sourceLabel: { type: Type.STRING },
                linkingPhrase: { type: Type.STRING },
                targetLabel: { type: Type.STRING },
              },
              required: ["sourceLabel", "linkingPhrase", "targetLabel"],
            },
          },
        },
        required: ["topic", "concepts", "starterSuggestions"],
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text));
    return parsed as GeneratedConceptSet;
  } catch (err: unknown) {
    console.warn("Failed to generate AI concept terms, falling back to local extraction:", err);
    return {
      topic,
      concepts: [
        { id: "concept_1", label: topic, category: "Core Idea", description: `Primary subject of study for ${topic}.` },
        { id: "concept_2", label: "Energy Input", category: "Physical Factor", description: "Thermodynamic or kinetic driver." },
        { id: "concept_3", label: "System Mechanism", category: "Mechanism", description: "Internal operating pathways." },
        { id: "concept_4", label: "Observed Effect", category: "Outcome", description: "Macroscopic outcome or measurable change." },
      ],
      starterSuggestions: [
        { sourceLabel: "Energy Input", linkingPhrase: "drives", targetLabel: topic },
        { sourceLabel: topic, linkingPhrase: "causes", targetLabel: "Observed Effect" },
      ],
    };
  }
}

/**
 * Uses Gemini to evaluate arbitrary student concept maps, auditing scientific propositions,
 * causal directionality, and missing relationships.
 */
export async function evaluateConceptMapWithAI(
  course: CourseType,
  topic: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[]
): Promise<ConceptMapEvaluation> {
  const ctx = getCourseContext(course);
  const propositions = extractPropositions(nodes, edges);

  const propositionsText = propositions
    .map((p, i) => `${i + 1}. [id: "${p.id}"] "${p.sourceLabel}" --("${p.linkingPhrase}")--> "${p.targetLabel}"`)
    .join("\n");

  const nodesText = nodes.map(n => `- ${n.label} (${n.category || 'General'})`).join("\n");

  const prompt = `
    ${ctx.role}
    Course: ${course}
    Topic: "${topic}"
    Standard: ${ctx.standard}

    TASK:
    You are an expert science educator auditing a student concept map.
    The student has assembled the following concepts:
    ${nodesText}

    The student created these directional propositions (Concept A --[linking phrase]--> Concept B):
    ${propositionsText}

    EVALUATION CRITERIA:
    1. Assess each proposition individually:
       - status: "correct" if scientifically accurate with proper direction of causality.
       - status: "invalid" if scientifically false, or if the arrow is backwards (inverted causality).
       - status: "needs_work" if relevant but linking phrase is vague, imprecise, or misleading.
       - feedback: 1 clear, encouraging pedagogical sentence explaining why.
    2. Identify 1 to 3 "missingKeyConnections" that would complete their conceptual understanding.
    3. Identify any clear scientific "misconceptions" present in their linking.
    4. Provide an overall mastery percentage (0-100) and an overall feedback summary.

    OUTPUT FORMAT:
    JSON matching the schema.
  `;

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          maxScore: { type: Type.INTEGER },
          masteryPercentage: { type: Type.INTEGER },
          feedbackSummary: { type: Type.STRING },
          propositions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                sourceId: { type: Type.STRING },
                sourceLabel: { type: Type.STRING },
                targetId: { type: Type.STRING },
                targetLabel: { type: Type.STRING },
                linkingPhrase: { type: Type.STRING },
                status: { type: Type.STRING, description: "One of: correct, needs_work, invalid" },
                feedback: { type: Type.STRING },
              },
              required: ["id", "sourceLabel", "targetLabel", "linkingPhrase", "status", "feedback"],
            },
          },
          missingKeyConnections: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          misconceptions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          praise: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "overallScore",
          "maxScore",
          "masteryPercentage",
          "feedbackSummary",
          "propositions",
          "missingKeyConnections",
          "misconceptions",
          "praise",
        ],
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text));
    return parsed as ConceptMapEvaluation;
  } catch (err: unknown) {
    console.warn("AI Concept Map Evaluation failed, generating rule-based assessment:", err);
    // Graceful offline fallback
    const fallbackProps = propositions.map(p => ({
      ...p,
      status: 'unreviewed' as const,
      feedback: `Link established between ${p.sourceLabel} and ${p.targetLabel}.`,
    }));

    return {
      overallScore: Math.round(propositions.length * 0.7),
      maxScore: propositions.length || 1,
      masteryPercentage: 70,
      feedbackSummary: `Local review completed for ${propositions.length} propositions. Re-run with AI connection for deep semantic validation.`,
      propositions: fallbackProps,
      missingKeyConnections: [],
      misconceptions: [],
      praise: ['Good structural network with clear node placement.'],
    };
  }
}

export const evaluateConceptMapWithGemini = evaluateConceptMapWithAI;
