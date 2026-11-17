import { Type } from "@google/genai";
import { callAI, cleanJsonResponse, getCourseContext, DEFAULT_MODEL } from "./core";
import {
  SkepticInvestigation,
  SkepticChallenge,
  SkepticEvaluation,
} from "../../components/skeptic/skepticTypes";
import { evaluateDefenseRebuttals } from "../../components/skeptic/skepticEngine";

/**
 * Uses Gemini to generate 3 targeted, rigorous peer review interrogations for an experimental design.
 */
export async function auditInvestigationWithSkeptic(
  investigation: SkepticInvestigation
): Promise<SkepticChallenge[]> {
  const ctx = getCourseContext(investigation.course);

  const prompt = `
    ${ctx.role}
    You are "The Skeptic", a world-class scientific peer reviewer, senior lab investigator, and rigorous methodologist.
    You scrutinize scientific hypotheses and experimental setups with polite but relentless Socratic skepticism.

    INVESTIGATION PROTOCOL:
    Course: ${investigation.course} (${investigation.topic})
    Title: "${investigation.title}"
    Research Question: "${investigation.researchQuestion}"
    Working Hypothesis: "${investigation.hypothesis}"
    Independent Variable: "${investigation.independentVariable}"
    Dependent Variable: "${investigation.dependentVariable}"
    Controlled Variables: "${investigation.controlledVariables.join(', ')}"
    Control Group: "${investigation.controlGroup}"
    Measurement Method: "${investigation.measurementMethod}"
    Potential Confounders Named by Student: "${(investigation.potentialConfounders || []).join(', ')}"

    TASK:
    Identify exactly 3 profound methodological vulnerabilities, hidden confounding variables, control group weaknesses, or measurement precision flaws in this proposed experiment.
    Ensure challenges cover different categories from:
    - "falsifiability" (Can this hypothesis truly be disproven? Is it circular?)
    - "variable_isolation" (Is there an unmanaged confounding variable moving simultaneously?)
    - "controls" (Is there an appropriate negative or positive control? What does the blank lack?)
    - "measurement_error" (Sensor drift, calibration error, human reaction time, non-linear instrument response)
    - "alternative_hypotheses" (What rival mechanism could produce this exact same data?)

    Do not use em-dashes in your response text.

    OUTPUT FORMAT:
    JSON strictly adhering to the schema.
  `;

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          challenges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                category: {
                  type: Type.STRING,
                  enum: [
                    "falsifiability",
                    "variable_isolation",
                    "controls",
                    "measurement_error",
                    "alternative_hypotheses",
                  ],
                },
                title: { type: Type.STRING },
                question: { type: Type.STRING },
                severity: {
                  type: Type.STRING,
                  enum: ["critical", "moderate", "minor"],
                },
                hint: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
              },
              required: [
                "id",
                "category",
                "title",
                "question",
                "severity",
                "hint",
                "suggestedFix",
              ],
            },
          },
        },
        required: ["challenges"],
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text));
    if (parsed && Array.isArray(parsed.challenges) && parsed.challenges.length > 0) {
      return (parsed.challenges as SkepticChallenge[]).map((c, idx) => ({
        ...c,
        id: c.id || `ai_challenge_${idx + 1}`,
      }));
    }
  } catch (err) {
    console.warn("AI Skeptic audit call failed or returned empty; using heuristic fallback.", err);
  }

  // Graceful fallback challenges if AI offline
  return [
    {
      id: "fallback_c1",
      category: "controls",
      title: "Negative Control Specification",
      question: "What baseline trial confirms that the observed change in the dependent variable is strictly dependent on the manipulated independent variable, rather than ambient conditions?",
      severity: "critical",
      hint: "A negative control holds all parameters constant while omitting the active agent.",
      suggestedFix: "Run a concurrent negative control trial under identical conditions with an inert substitute.",
    },
    {
      id: "fallback_c2",
      category: "variable_isolation",
      title: "Confounding Variable Management",
      question: "How do you guarantee that thermal, environmental, or concentration gradients do not correlate with your test trials?",
      severity: "moderate",
      hint: "Ensure environmental parameters remain isolated throughout all experimental intervals.",
      suggestedFix: "Conduct randomized trial sequencing and monitor ambient laboratory variables continuously.",
    },
    {
      id: "fallback_c3",
      category: "measurement_error",
      title: "Quantification of Instrument Uncertainty",
      question: "What is the systematic resolution and measurement uncertainty of your primary detection apparatus?",
      severity: "moderate",
      hint: "Every physical measuring tool possesses a finite limit of precision.",
      suggestedFix: "Conduct 5 repeat calibration measurements on known reference standards to establish experimental variance.",
    },
  ];
}

/**
 * Uses Gemini to evaluate student defense rebuttals and assign an academic peer review verdict.
 */
export async function evaluateDefenseWithSkeptic(
  investigation: SkepticInvestigation,
  challenges: SkepticChallenge[],
  rebuttals: Record<string, string>
): Promise<SkepticEvaluation> {
  const ctx = getCourseContext(investigation.course);

  const prompt = `
    ${ctx.role}
    You are "The Skeptic", presiding over a scientific defense hearing.
    You must evaluate how effectively the student investigator defended their experimental design against 3 peer review challenges.

    INVESTIGATION:
    Title: "${investigation.title}"
    Hypothesis: "${investigation.hypothesis}"
    Independent Variable: "${investigation.independentVariable}"
    Dependent Variable: "${investigation.dependentVariable}"

    CHALLENGES & STUDENT REBUTTALS:
    ${challenges
      .map(
        (c, idx) => `
      Challenge #${idx + 1} (${c.title}):
      Question: "${c.question}"
      Student Defense: "${rebuttals[c.id] || "No response provided"}"
    `
      )
      .join("\n")}

    EVALUATION STANDARDS:
    - Assess if the student provided actionable procedural fixes, quantitative controls, or theoretical adjustments.
    - Compute a rigorScore (0 to 100).
    - Assign overallVerdict: "approved" (score >= 80, comprehensive fixes), "revisions_requested" (score 50-79, partial fixes), or "rejected" (score < 50, evasive or superficial).
    - Provide 2 to 3 concise bullet strengths, vulnerabilities, and recommendations.
    - Strictly avoid any em-dashes.

    OUTPUT FORMAT:
    JSON strictly conforming to schema.
  `;

  try {
    const response = await callAI(DEFAULT_MODEL, prompt, {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallVerdict: {
            type: Type.STRING,
            enum: ["approved", "revisions_requested", "rejected"],
          },
          rigorScore: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          vulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "overallVerdict",
          "rigorScore",
          "strengths",
          "vulnerabilities",
          "recommendations",
        ],
      },
    });

    const parsed = JSON.parse(cleanJsonResponse(response.text));
    if (parsed && typeof parsed.rigorScore === "number") {
      return {
        overallVerdict: parsed.overallVerdict,
        rigorScore: Math.round(parsed.rigorScore),
        strengths: parsed.strengths || [],
        vulnerabilities: parsed.vulnerabilities || [],
        recommendations: parsed.recommendations || [],
        evaluatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("AI Defense evaluation failed; falling back to heuristic engine.", err);
  }

  return evaluateDefenseRebuttals(investigation, challenges, rebuttals);
}
