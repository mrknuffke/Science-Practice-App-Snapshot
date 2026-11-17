import {
  SkepticInvestigation,
  SkepticChallenge,
  SkepticEvaluation,
} from './skepticTypes';

/**
 * Evaluates student rebuttals to Skeptic challenges using heuristic analysis of scientific rigor.
 */
export function evaluateDefenseRebuttals(
  investigation: SkepticInvestigation,
  challenges: SkepticChallenge[],
  rebuttals: Record<string, string>
): SkepticEvaluation {
  const answeredCount = challenges.filter(
    c => (rebuttals[c.id] || '').trim().length > 15
  ).length;

  const totalChallenges = challenges.length;
  if (totalChallenges === 0) {
    return {
      overallVerdict: 'approved',
      rigorScore: 100,
      strengths: ['Experimental protocol demonstrates sound preliminary design principles.'],
      vulnerabilities: [],
      recommendations: ['Maintain strict laboratory notebook records during data collection.'],
      evaluatedAt: new Date().toISOString(),
    };
  }

  let earnedPoints = 0;
  const maxPoints = totalChallenges * 25; // 25 points per challenge
  const strengths: string[] = [];
  const vulnerabilities: string[] = [];
  const recommendations: string[] = [];

  challenges.forEach(challenge => {
    const text = (rebuttals[challenge.id] || '').trim().toLowerCase();
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (wordCount < 5) {
      vulnerabilities.push(
        `Unaddressed or superficial defense on "${challenge.title}" (${challenge.severity} severity).`
      );
      recommendations.push(
        challenge.suggestedFix ||
          `Provide an explicit protocol modification to address ${challenge.category.replace('_', ' ')}.`
      );
      return;
    }

    let challengePoints = 10; // baseline for answering

    // Check for quality scientific indicators in defense
    const scientificKeywords = [
      'control',
      'calibrate',
      'uncertainty',
      'error',
      'isolate',
      'standardize',
      'blank',
      'trial',
      'replicate',
      'deviation',
      'measure',
      'constant',
      'temperature',
      'pressure',
      'sensor',
      'activity',
      'linear',
      'verify',
      'equation',
    ];

    const matchedKeywords = scientificKeywords.filter(kw => text.includes(kw));

    if (matchedKeywords.length >= 3) {
      challengePoints += 10;
    } else if (matchedKeywords.length >= 1) {
      challengePoints += 5;
    }

    if (wordCount >= 25) {
      challengePoints += 5;
    }

    earnedPoints += challengePoints;

    if (challengePoints >= 20) {
      strengths.push(
        `Robust defense and corrective protocol offered for "${challenge.title}".`
      );
    } else {
      vulnerabilities.push(
        `Defense on "${challenge.title}" lacks quantitative error estimation or specific procedural controls.`
      );
      if (challenge.suggestedFix) {
        recommendations.push(challenge.suggestedFix);
      }
    }
  });

  const rigorScore = Math.min(100, Math.round((earnedPoints / maxPoints) * 100));

  let overallVerdict: 'approved' | 'revisions_requested' | 'rejected' = 'rejected';
  if (rigorScore >= 80 && answeredCount === totalChallenges) {
    overallVerdict = 'approved';
  } else if (rigorScore >= 50) {
    overallVerdict = 'revisions_requested';
  }

  if (strengths.length === 0) {
    strengths.push('Hypothesis provides a structured initial starting point for inquiry.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Prepare error bars and standard deviation protocols before executing wet-lab trials.');
  }

  return {
    overallVerdict,
    rigorScore,
    strengths,
    vulnerabilities,
    recommendations,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a formal academic Peer Review Memorandum in Markdown.
 */
export function exportPeerReviewReportToMarkdown(
  investigation: SkepticInvestigation,
  challenges: SkepticChallenge[],
  rebuttals: Record<string, string>,
  evaluation?: SkepticEvaluation
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  let md = `# Formal Peer Review Memorandum: ${investigation.title}\n\n`;
  md += `**Lead Investigator / Student:** Academic Science Fellow  \n`;
  md += `**Discipline / Course:** ${investigation.course} (${investigation.topic})  \n`;
  md += `**Audit Date:** ${dateStr}  \n`;
  md += `**Peer Review Board:** The Skeptic (Science Practice Partner)  \n\n`;

  md += `## 1. Experimental Design Overview\n\n`;
  md += `- **Research Question:** ${investigation.researchQuestion}\n`;
  md += `- **Working Hypothesis:** ${investigation.hypothesis}\n`;
  md += `- **Independent Variable:** ${investigation.independentVariable}\n`;
  md += `- **Dependent Variable:** ${investigation.dependentVariable}\n`;
  md += `- **Control Group / Baseline:** ${investigation.controlGroup}\n`;
  md += `- **Controlled Variables:** ${investigation.controlledVariables.join(', ')}\n`;
  md += `- **Primary Measurement Technique:** ${investigation.measurementMethod}\n\n`;

  if (evaluation) {
    const verdictTitle =
      evaluation.overallVerdict === 'approved'
        ? 'APPROVED: Methodology Certified for Laboratory Execution'
        : evaluation.overallVerdict === 'revisions_requested'
        ? 'REVISIONS REQUIRED: Address Methodological Ambiguities'
        : 'REJECTED: Fundamental Experimental Redesign Advised';

    md += `## 2. Peer Review Verdict & Rigor Assessment\n\n`;
    md += `> **Reviewer Decision:** ${verdictTitle}  \n`;
    md += `> **Methodological Rigor Score:** ${evaluation.rigorScore}/100  \n\n`;

    md += `### Primary Commendations & Strengths\n\n`;
    evaluation.strengths.forEach(s => {
      md += `- ${s}\n`;
    });
    md += `\n`;

    if (evaluation.vulnerabilities.length > 0) {
      md += `### Vulnerabilities & Confounding Risks\n\n`;
      evaluation.vulnerabilities.forEach(v => {
        md += `- ${v}\n`;
      });
      md += `\n`;
    }

    if (evaluation.recommendations.length > 0) {
      md += `### Mandatory Methodological Revisions\n\n`;
      evaluation.recommendations.forEach(r => {
        md += `1. ${r}\n`;
      });
      md += `\n`;
    }
  }

  md += `## 3. Defense Audit Interrogations & Investigator Rebuttals\n\n`;

  challenges.forEach((c, idx) => {
    const studentResponse = rebuttals[c.id] || '_No formal defense submitted by investigator._';
    md += `### Challenge ${idx + 1}: ${c.title} (${c.category.toUpperCase()}, ${c.severity.toUpperCase()} SEVERITY)\n\n`;
    md += `**The Skeptic Inquires:**  \n_${c.question}_\n\n`;
    md += `**Investigator Rebuttal & Protocol Defense:**  \n${studentResponse}\n\n`;
    if (c.suggestedFix) {
      md += `**Recommended Benchmark Solution:**  \n_${c.suggestedFix}_\n\n`;
    }
    md += `---\n\n`;
  });

  md += `_Report certified by The Skeptic AI Peer Review Partner (https://sciencepractice.app)_\n`;
  return md;
}
