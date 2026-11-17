import { CourseType } from '../../types';
import {
  PersonaId,
  PersonaChatMessage,
  TutorMathStep,
  GrowthCoachErrorAnalysis,
} from './personaeTypes';

/**
 * Classifies a student's described academic error into a 4-part metacognitive taxonomy.
 */
export function classifyErrorTaxonomy(input: string): GrowthCoachErrorAnalysis {
  const text = input.toLowerCase();

  // 1. Calculation Error
  if (
    /(unit|convert|conversion|math|calculation|arithmetic|formula|calculator|factor of|plugged in|divided instead|multiplied instead|sig fig|decimal)/i.test(
      text
    )
  ) {
    return {
      category: 'calculation',
      categoryLabel: 'Mathematical / Unit Conversion Slip',
      summary:
        'Your conceptual model was sound, but an execution slip in unit conversion, algebraic rearrangement, or arithmetic calculation altered the outcome.',
      correctiveStrategy:
        'Always bracket dimensional analysis units through every substitution step. Carry units through cross-multiplication before touching a calculator.',
      growthAffirmation:
        'Calculation slips are high-leverage opportunities: you already understand the underlying scientific principle; you only need to refine your procedural safety checks.',
    };
  }

  // 2. Misread / Overlooked Constraint
  if (
    /(misread|overlooked|rushed|didn't see|did not see|missed the word|except|not|double negative|hurried|assumed|skimming)/i.test(
      text
    )
  ) {
    return {
      category: 'misread',
      categoryLabel: 'Prompt Constraint Overlook / Misread',
      summary:
        'The primary difficulty stemmed from overlooking a critical prompt constraint (such as a negative qualifier, reversed condition, or specific requested unit).',
      correctiveStrategy:
        'Circle or highlight prompt qualifiers like "NOT", "EXCEPT", "INCREASES", or "EQUILIBRIUM" before formulating your answer. Paraphrase what is being asked before solving.',
      growthAffirmation:
        'Precision reading under timed testing pressure is a trainable skill. Recognizing this habit is the first step toward master-level test endurance.',
    };
  }

  // 3. Recall Blank / Retrieval Gap
  if (
    /(blanked|forgot|couldn't remember|could not remember|mixed up|confused with|memoriz|retrieval|name of|which one was which)/i.test(
      text
    )
  ) {
    return {
      category: 'recall_gap',
      categoryLabel: 'Factual Recall / Term Retrieval Gap',
      summary:
        'A momentary retrieval failure between closely related technical terms, homologous structures, or counter-acting biochemical messengers.',
      correctiveStrategy:
        'Use contrasting flashcards (e.g. Venn diagrams comparing Aldosterone vs ADH) and active retrieval practice rather than passive re-reading.',
      growthAffirmation:
        'Memory retrieval blanks are natural friction points in learning. Testing yourself repeatedly with retrieval spacing transforms fragile memories into permanent schemas.',
    };
  }

  // 4. Default: Conceptual Misconception
  return {
    category: 'misconception',
    categoryLabel: 'Underlying Conceptual Misconception',
    summary:
      'An intuitive or incomplete mental model of how the scientific mechanism operates under varying conditions.',
    correctiveStrategy:
      'Map the complete causal chain from first principles: Stimulus → Primary Mechanism → Intermediate State → Observable Consequence.',
    growthAffirmation:
      'Confronting misconceptions is where the deepest scientific learning happens. Abandoning an incomplete model to build a robust one is the authentic scientific method.',
  };
}

/**
 * Extracts structured mathematical steps from AI explanations or user notes.
 */
export function parseTutorMathSteps(text: string): TutorMathStep[] {
  const steps: TutorMathStep[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let stepCounter = 1;
  for (const line of lines) {
    // Look for lines beginning with Step N, 1., 2., etc.
    const match = line.match(/^(?:step\s*(\d+)[:.]?|(\d+)[.)])\s*(.*)/i);
    if (match) {
      const stepNum = parseInt(match[1] || match[2], 10);
      const content = match[3] || line;

      // Extract formula or equation if present
      let formula = '';
      let calculation = '';
      let explanation = content;

      if (content.includes('=')) {
        const parts = content.split(':');
        if (parts.length > 1) {
          explanation = parts[0].trim();
          calculation = parts.slice(1).join(':').trim();
        } else {
          calculation = content;
        }
      }

      steps.push({
        stepNumber: stepNum || stepCounter,
        label: `Step ${stepNum || stepCounter}`,
        formula,
        calculation,
        explanation,
      });
      stepCounter++;
    }
  }

  return steps;
}

/**
 * Evaluates the depth of student inquiry in Socratic dialogue (0 to 100%).
 */
export function measureSocraticDepth(history: PersonaChatMessage[]): number {
  if (history.length === 0) return 10;

  const userMessages = history.filter(h => h.role === 'user');
  if (userMessages.length === 0) return 15;

  let totalPoints = 20;

  // Turn count contribution (up to 30 points)
  totalPoints += Math.min(30, userMessages.length * 8);

  // Word count and articulation depth contribution (up to 30 points)
  const avgWords =
    userMessages.reduce((sum, m) => sum + m.text.trim().split(/\s+/).length, 0) /
    userMessages.length;
  if (avgWords >= 20) totalPoints += 30;
  else if (avgWords >= 12) totalPoints += 20;
  else if (avgWords >= 6) totalPoints += 10;

  // Causal connector bonus (up to 20 points)
  const causalMatches = userMessages.filter(m =>
    /\b(because|therefore|since|consequently|leads to|results in|mechanism|proportional|inversely)\b/i.test(
      m.text
    )
  ).length;
  totalPoints += Math.min(20, causalMatches * 10);

  return Math.min(100, Math.max(10, totalPoints));
}

/**
 * Generates an offline pedagogical fallback response when Gemini is unreachable.
 */
export function generateOfflineFallbackResponse(
  persona: PersonaId,
  course: CourseType,
  topic: string,
  lastUserMessage: string
): string {
  const cleanMsg = lastUserMessage.trim();

  if (persona === 'tutor') {
    return `### Step-by-Step Guidance on ${topic} (${course})

Let's break down your question: **"${cleanMsg.slice(0, 100)}${cleanMsg.length > 100 ? '...' : ''}"**

1. **Identify the Given Quantities & Target:**
   - Write out every known variable with standard scientific units.
   - Clarify the exact target variable you are solving for.

2. **Select the Governing Principle or Formula:**
   - In ${course}, this topic connects directly to fundamental conservation laws and stoichiometric/kinematic equations.
   - Check the interactive scratchpad to set up your dimensional analysis or algebraic expression.

3. **Check the Next Step:**
   - Type your proposed calculation or intermediate value into the chat, and we will verify the math together!`;
  }

  if (persona === 'socratic') {
    return `That brings up an essential scientific question regarding **${topic}**.

Before we look at the conclusion, let's examine the underlying cause:

*What specific physical or chemical condition must change first for that observable result to happen?*

Take a moment to describe the mechanism in your own words. Why does that relationship hold true here?`;
  }

  // Growth Coach
  const analysis = classifyErrorTaxonomy(cleanMsg);
  return `### Growth Coach Reflection & Diagnostic

I hear you, and this is exactly where true scientific competence is built. Let's analyze this with a growth mindset:

**Identified Focus:** ${analysis.categoryLabel}
${analysis.summary}

**Actionable Strategy:**
${analysis.correctiveStrategy}

**Keep in Mind:**
${analysis.growthAffirmation}

What is one concrete check you can use next time you tackle a problem like this?`;
}

/**
 * Exports a session transcript as a clean, downloadable Markdown document.
 */
export function exportPersonaSessionToMarkdown(
  persona: PersonaId,
  course: CourseType,
  topic: string,
  history: PersonaChatMessage[],
  scratchpad?: string
): string {
  const titles: Record<PersonaId, string> = {
    tutor: 'AI Science Tutor: Step-by-Step Problem Solving Guide',
    socratic: 'Socratic Inquiry & Conceptual Discovery Transcript',
    growth_coach: 'Growth Coach: Metacognitive Error Analysis & Action Plan',
  };

  const personaLabel: Record<PersonaId, string> = {
    tutor: 'Direct AI Tutor',
    socratic: 'Socratic Inquiry Guide',
    growth_coach: 'Growth Mindset Coach',
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# ${titles[persona]}\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Course:** ${course}  \n`;
  md += `**Topic:** ${topic}  \n`;
  md += `**Pedagogical Persona:** ${personaLabel[persona]}  \n\n`;
  md += `---\n\n`;

  if (scratchpad && scratchpad.trim()) {
    md += `## 📝 Working Scratchpad & Formula Notes\n\n`;
    md += `\`\`\`text\n${scratchpad.trim()}\n\`\`\`\n\n---\n\n`;
  }

  md += `## 💬 Interactive Dialogue Transcript\n\n`;
  history.forEach((msg, idx) => {
    const sender = msg.role === 'user' ? '👤 **Student**' : `🤖 **${personaLabel[persona]}**`;
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    md += `### ${idx + 1}. ${sender} *(${time})*\n\n`;
    md += `${msg.text.trim()}\n\n`;
  });

  md += `---\n\n*Generated by Science Practice Partner (sciencepractice.app): Standalone AI Personae Mode.*\n`;
  return md;
}
