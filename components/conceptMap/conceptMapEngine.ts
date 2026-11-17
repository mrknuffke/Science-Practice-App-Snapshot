import {
  ConceptNode,
  ConceptEdge,
  Proposition,
  ConceptMapEvaluation,
  ConceptMapPreset,
} from './conceptMapTypes';

/**
 * Extracts directional propositions from nodes and edges.
 */
export function extractPropositions(
  nodes: ConceptNode[],
  edges: ConceptEdge[]
): Proposition[] {
  const nodeMap = new Map<string, ConceptNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  return edges.map(edge => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    return {
      id: edge.id,
      sourceId: edge.source,
      sourceLabel: sourceNode ? sourceNode.label : edge.source,
      targetId: edge.target,
      targetLabel: targetNode ? targetNode.label : edge.target,
      linkingPhrase: edge.label || 'relates to',
      status: edge.status || 'unreviewed',
      feedback: edge.feedback || '',
    };
  });
}

/**
 * Normalizes phrases for fuzzy semantic matching.
 */
function normalizePhrase(phrase: string): string {
  return phrase.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Maps common synonym stems to unified canonical concepts.
 */
const SYNONYM_MAP: Record<string, string> = {
  makes: 'produces',
  yields: 'produces',
  generates: 'produces',
  creates: 'produces',
  synthesizes: 'produces',
  uses: 'consumes',
  absorbs: 'consumes',
  takesin: 'consumes',
  needs: 'requires',
  dependson: 'requires',
  speedsup: 'catalyzes',
  accelerates: 'catalyzes',
  blocks: 'inhibits',
  suppresses: 'inhibits',
  slowsdown: 'decreases',
  lowers: 'decreases',
  raises: 'increases',
  boosts: 'increases',
  contain: 'iscomposedof',
  madeof: 'iscomposedof',
  consistsof: 'iscomposedof',
};

function canonicalizePhrase(phrase: string): string {
  const norm = normalizePhrase(phrase);
  return SYNONYM_MAP[norm] || norm;
}

/**
 * Evaluates propositions locally when using a known preset.
 */
export function evaluatePresetMap(
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  preset: ConceptMapPreset
): ConceptMapEvaluation {
  const propositions = extractPropositions(nodes, edges);
  const canonical = preset.canonicalPropositions;

  let correctCount = 0;
  const praise: string[] = [];
  const misconceptions: string[] = [];

  const evaluatedProps: Proposition[] = propositions.map(prop => {
    const sNorm = normalizePhrase(prop.sourceLabel);
    const tNorm = normalizePhrase(prop.targetLabel);
    const linkNorm = canonicalizePhrase(prop.linkingPhrase);

    // Direct match check
    const directMatch = canonical.find(c => {
      const cSNorm = normalizePhrase(c.sourceLabel);
      const cTNorm = normalizePhrase(c.targetLabel);
      const cLNorm = canonicalizePhrase(c.linkingPhrase);

      return cSNorm === sNorm && cTNorm === tNorm && (cLNorm === linkNorm || linkNorm.includes(cLNorm) || cLNorm.includes(linkNorm));
    });

    if (directMatch) {
      correctCount++;
      return {
        ...prop,
        status: 'correct',
        feedback: `Sound relationship: ${prop.sourceLabel} [${prop.linkingPhrase}] ${prop.targetLabel}.`,
      };
    }

    // Inverted arrow check: did the student reverse the direction of causality?
    const invertedMatch = canonical.find(c => {
      const cSNorm = normalizePhrase(c.sourceLabel);
      const cTNorm = normalizePhrase(c.targetLabel);
      return cSNorm === tNorm && cTNorm === sNorm;
    });

    if (invertedMatch) {
      misconceptions.push(`Directional inversion: ${prop.sourceLabel} does not direct ${prop.targetLabel}. Expected relationship points from ${invertedMatch.sourceLabel} to ${invertedMatch.targetLabel}.`);
      return {
        ...prop,
        status: 'invalid',
        feedback: `Inverted arrow: ${invertedMatch.sourceLabel} directs ${invertedMatch.targetLabel}, not the reverse.`,
      };
    }

    // Related nodes but vague or unaligned linking phrase
    const relatedPair = canonical.find(c => {
      const cSNorm = normalizePhrase(c.sourceLabel);
      const cTNorm = normalizePhrase(c.targetLabel);
      return cSNorm === sNorm && cTNorm === tNorm;
    });

    if (relatedPair) {
      return {
        ...prop,
        status: 'needs_work',
        feedback: `Connection is relevant, but linking phrase "${prop.linkingPhrase}" could be more precise (e.g. "${relatedPair.linkingPhrase}").`,
      };
    }

    // Novel or unlisted proposition
    return {
      ...prop,
      status: 'unreviewed',
      feedback: `Plausible associative link: verify if "${prop.linkingPhrase}" represents direct scientific causality.`,
    };
  });

  // Check for missing key canonical connections
  const connectedPairs = new Set(
    propositions.map(p => `${normalizePhrase(p.sourceLabel)}->${normalizePhrase(p.targetLabel)}`)
  );

  const missingKeyConnections: string[] = [];
  canonical.forEach(c => {
    const key = `${normalizePhrase(c.sourceLabel)}->${normalizePhrase(c.targetLabel)}`;
    if (!connectedPairs.has(key)) {
      missingKeyConnections.push(`${c.sourceLabel} [${c.linkingPhrase}] ${c.targetLabel}`);
    }
  });

  const maxScore = Math.max(canonical.length, propositions.length || 1);
  const overallScore = Math.min(maxScore, correctCount);
  const masteryPercentage = Math.round((overallScore / maxScore) * 100);

  if (masteryPercentage >= 80) {
    praise.push('Exceptional structural grasp: relationships accurately reflect core scientific dynamics.');
  } else if (masteryPercentage >= 50) {
    praise.push('Solid foundation: primary central pathways are correctly connected.');
  }

  let feedbackSummary = `Evaluated ${propositions.length} proposition${propositions.length === 1 ? '' : 's'}. `;
  if (correctCount === canonical.length) {
    feedbackSummary += 'All canonical relationships are accurately mapped!';
  } else {
    feedbackSummary += `${correctCount} validated as canonically sound. Review flagged edges and missing connections to enhance schema fidelity.`;
  }

  return {
    overallScore,
    maxScore,
    masteryPercentage,
    feedbackSummary,
    propositions: evaluatedProps,
    missingKeyConnections,
    misconceptions,
    praise,
  };
}

/**
 * Arranges nodes evenly in a circle around a center coordinate.
 */
export function applyCircleLayout(
  nodes: ConceptNode[],
  centerX = 450,
  centerY = 300,
  radius = 220
): ConceptNode[] {
  const count = nodes.length;
  if (count === 0) return [];

  const angleStep = (2 * Math.PI) / count;
  return nodes.map((node, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      ...node,
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    };
  });
}

export const arrangeInCircle = applyCircleLayout;

/**
 * Converts the concept map to valid Mermaid graph markdown.
 */
export function exportToMermaid(
  title: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[]
): string {
  const cleanId = (id: string) => id.replace(/[^a-zA-Z0-9_]/g, '_');
  const cleanLabel = (text: string) => text.replace(/["\n\r]/g, '').trim();

  const lines: string[] = ['graph TD'];

  // Node definitions with safe quoted labels
  nodes.forEach(n => {
    lines.push(`  ${cleanId(n.id)}["${cleanLabel(n.label)}"]`);
  });

  // Edge definitions with linking phrases
  edges.forEach(e => {
    const linkText = cleanLabel(e.label || 'relates to');
    lines.push(`  ${cleanId(e.source)} -->|"${linkText}"| ${cleanId(e.target)}`);
  });

  return `%% ${title}\n` + lines.join('\n');
}

/**
 * Exports complete map and evaluation to structured Markdown.
 */
export function exportToMarkdown(
  title: string,
  course: string,
  topic: string,
  nodes: ConceptNode[],
  edges: ConceptEdge[],
  evaluation?: ConceptMapEvaluation
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  let md = `# Concept Map: ${title}\n\n`;
  md += `**Course:** ${course}  \n`;
  md += `**Topic:** ${topic}  \n`;
  md += `**Date:** ${dateStr}  \n\n`;

  md += `## 1. Visual Web (Mermaid Diagram)\n\n`;
  md += '```mermaid\n';
  md += exportToMermaid(title, nodes, edges);
  md += '\n```\n\n';

  md += `## 2. Propositions (${edges.length} connections)\n\n`;
  const propositions = extractPropositions(nodes, edges);
  if (propositions.length === 0) {
    md += '_No propositions created yet._\n\n';
  } else {
    propositions.forEach((p, idx) => {
      const statusIcon = p.status === 'correct' ? '✅' : p.status === 'invalid' ? '❌' : p.status === 'needs_work' ? '⚠️' : 'ℹ️';
      md += `${idx + 1}. **${p.sourceLabel}** $\\xrightarrow{\\text{${p.linkingPhrase}}}$ **${p.targetLabel}** ${statusIcon}\n`;
      if (p.feedback) {
        md += `   - _${p.feedback}_\n`;
      }
    });
    md += '\n';
  }

  if (evaluation) {
    md += `## 3. Conceptual Evaluation\n\n`;
    md += `- **Mastery Score:** ${evaluation.masteryPercentage}% (${evaluation.overallScore}/${evaluation.maxScore} canonical connections)\n`;
    md += `- **Summary:** ${evaluation.feedbackSummary}\n\n`;

    if (evaluation.missingKeyConnections.length > 0) {
      md += `### Recommended Connections to Explore\n`;
      evaluation.missingKeyConnections.forEach(m => {
        md += `- [ ] ${m}\n`;
      });
      md += '\n';
    }

    if (evaluation.misconceptions.length > 0) {
      md += `### Conceptual Adjustments\n`;
      evaluation.misconceptions.forEach(m => {
        md += `- ⚠️ ${m}\n`;
      });
      md += '\n';
    }
  }

  md += `---\n_Generated by Science Practice Partner (https://sciencepractice.app)_\n`;
  return md;
}
