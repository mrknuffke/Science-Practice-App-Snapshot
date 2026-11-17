import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RubricDiffViewer } from '../RubricDiffViewer';
import { DetailedFeedback } from '../../../types';

describe('RubricDiffViewer', () => {
  const cerFeedback: DetailedFeedback = {
    question: 'Determine the effect of temperature on catalase reaction rate.',
    studentAnswer: 'The enzyme worked fastest at 40C because it had the most bubbles.',
    evaluation: 'Partially Correct',
    feedback: 'Good start identifying 40C, but you need to cite data and discuss kinetic energy.',
    tutorDeepDive: 'Enzyme kinetics accelerate with temperature until thermal denaturation.',
    keyConcept: 'Enzyme denaturation & kinetic energy',
    misconceptionAlert: 'Higher temperature does not always mean higher rate.',
    rubricScore: '+2/3 pts',
    modelAnswer: 'Claim: Catalase reaction rate peaks at 40°C. Evidence: Oxygen production reached 45 mL/min at 40°C compared to 12 mL/min at 20°C. Reasoning: Increasing temperature raises substrate collision frequency until thermal denaturation disrupts the active site.',
    rubricBreakdown: [
      {
        criterion: 'Claim / Direct Answer',
        status: 'met',
        pointsAwarded: 1,
        pointsPossible: 1,
        studentExclusionOrMatch: 'Correctly identified 40°C as the optimal temperature.',
        modelEvidence: 'Catalase reaction rate peaks at 40°C.',
        suggestedRevision: undefined
      },
      {
        criterion: 'Evidence / Data Citation',
        status: 'partially_met',
        pointsAwarded: 0.5,
        pointsPossible: 1,
        studentExclusionOrMatch: 'Mentioned bubbles qualitatively but did not cite specific mL/min values from the exhibit table.',
        modelEvidence: 'Cited 45 mL/min at 40°C vs 12 mL/min at 20°C from Exhibit A.',
        suggestedRevision: 'Quote the exact oxygen volume: "The reaction produced 45 mL/min at 40°C compared to 12 mL/min at 20°C."'
      },
      {
        criterion: 'Scientific Reasoning',
        status: 'missing',
        pointsAwarded: 0,
        pointsPossible: 1,
        studentExclusionOrMatch: 'Omitted biological explanation regarding enzyme-substrate collisions or denaturation.',
        modelEvidence: 'Connected kinetic molecular theory to activation energy and tertiary protein structure.',
        suggestedRevision: 'Explain the mechanism: "Thermal energy increases molecular collision frequency, but exceeding optimum causes active site denaturation."'
      }
    ]
  };

  it('renders nothing when neither rubric breakdown nor model answer is present', () => {
    const emptyFeedback: DetailedFeedback = {
      question: 'What is ATP?',
      studentAnswer: 'Energy',
      evaluation: 'Correct',
      feedback: 'Good',
      tutorDeepDive: 'ATP is energy currency',
      keyConcept: 'ATP',
      misconceptionAlert: 'ATP is not energy itself'
    };

    const { container } = render(<RubricDiffViewer feedback={emptyFeedback} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders CER rubric breakdown with status badges and points', () => {
    render(<RubricDiffViewer feedback={cerFeedback} />);

    // Header & Score
    expect(screen.getByText('Rubric Alignment & Model Analysis')).toBeDefined();
    expect(screen.getByText('+2/3 pts')).toBeDefined();

    // Summary counts
    expect(screen.getByText('1 Met')).toBeDefined();
    expect(screen.getByText('1 Partial')).toBeDefined();
    expect(screen.getByText('1 Missing')).toBeDefined();

    // Criteria titles
    expect(screen.getByText('Claim / Direct Answer')).toBeDefined();
    expect(screen.getByText('Evidence / Data Citation')).toBeDefined();
    expect(screen.getByText('Scientific Reasoning')).toBeDefined();

    // Suggested revision upgrade boxes
    expect(screen.getByText(/Quote the exact oxygen volume/)).toBeDefined();
    expect(screen.getByText(/Explain the mechanism/)).toBeDefined();
  });

  it('toggles between Rubric Checklist and Model Comparison tabs', () => {
    render(<RubricDiffViewer feedback={cerFeedback} />);

    // Initially on Rubric Checklist
    expect(screen.getByText('Claim / Direct Answer')).toBeDefined();

    // Click Model Comparison tab
    const comparisonButton = screen.getByRole('button', { name: /Model Comparison/i });
    fireEvent.click(comparisonButton);

    // Should now display side-by-side view with exemplar and student response
    expect(screen.getByText('Your Submitted Response')).toBeDefined();
    expect(screen.getByText('Gold-Standard Exemplar')).toBeDefined();
    expect(screen.getByText(/Catalase reaction rate peaks/)).toBeDefined();
  });

  it('renders model comparison even if rubricBreakdown is empty but modelAnswer is present', () => {
    const modelOnlyFeedback: DetailedFeedback = {
      question: 'Explain osmosis',
      studentAnswer: 'Water moves',
      evaluation: 'Partially Correct',
      feedback: 'Incomplete',
      tutorDeepDive: 'Osmosis is passive',
      keyConcept: 'Osmosis',
      misconceptionAlert: 'Osmosis is only water',
      modelAnswer: 'Osmosis is the net diffusion of water across a semipermeable membrane from low solute to high solute concentration.'
    };

    render(<RubricDiffViewer feedback={modelOnlyFeedback} />);

    expect(screen.getByText('Gold-Standard Exemplar')).toBeDefined();
    expect(screen.getByText(/net diffusion of water/)).toBeDefined();
  });
});
