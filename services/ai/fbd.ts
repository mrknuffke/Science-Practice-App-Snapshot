import { FbdForce, FbdScenario, FbdAiFeedback } from '../../types';
import { DEFAULT_MODEL, callAI, cleanJsonResponse } from './core';
import { Type } from '@google/genai';

export async function getFbdFeedback(scenario: FbdScenario, studentForces: FbdForce[]): Promise<FbdAiFeedback> {
  const forcesSummary = studentForces.map(f =>
    `${f.label} (${f.type}): magnitude=${f.magnitude.toFixed(0)} N, angle=${f.angle.toFixed(0)}°`
  ).join('\n');

  const expectedSummary = scenario.expectedForces.map(ef =>
    `${ef.label} (${ef.type}): angle=${ef.angle}°`
  ).join('\n');

  const prompt = `You are an encouraging AP Physics tutor evaluating a student's free body diagram.

SCENARIO: "${scenario.title}"
Description: ${scenario.description}

EXPECTED FORCES (for reference):
${expectedSummary}

STUDENT'S FORCES:
${forcesSummary || '(No forces placed)'}

Evaluate the student's FBD. Be specific about what they got right, what is wrong or missing, and explain the underlying physics clearly. Be encouraging and educational. Keep responses concise — 1-2 sentences per item.

Respond as JSON with this structure:
{
  "overallVerdict": "...",
  "strengths": ["...", "..."],
  "issues": ["...", "..."],
  "teachingPoints": ["...", "..."]
}`;

  const response = await callAI(DEFAULT_MODEL, prompt, {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        overallVerdict: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
        teachingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['overallVerdict', 'strengths', 'issues', 'teachingPoints'],
    },
  });

  const parsed = JSON.parse(cleanJsonResponse(response.text ?? '{}'));
  return {
    overallVerdict: parsed.overallVerdict ?? '',
    strengths: parsed.strengths ?? [],
    issues: parsed.issues ?? [],
    teachingPoints: parsed.teachingPoints ?? [],
  };
}
