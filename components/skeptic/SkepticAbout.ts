import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const SKEPTIC_ABOUT: SimulationAboutContent = {
  title: 'The Skeptic (AI Peer Review Partner)',
  summary: 'A rigorous scientific pre-lab defense chamber where an AI peer reviewer interrogates your experimental design, probes for hidden confounding variables, and evaluates methodological robustness.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Experimental Protocol Deck: A structured manifest documenting your research question, hypothesis, variable isolation, control groups, and measurement techniques.',
        'The Skeptic Challenge Cards: Socratic interrogations highlighted by severity (Critical, Moderate, or Minor) targeting potential experimental blind spots.',
        'Interactive Rebuttal Chamber: A courtroom-style defense panel where you draft procedural rebuttals, introduce corrective controls, and defend your assumptions.',
        'Reviewer Verdict & Rigor Meter: A comprehensive evaluation displaying your Methodological Rigor Score, key experimental strengths, and mandatory revisions.',
        'Formal Peer Review Memorandum: An exportable academic report synthesizing the investigation, challenges, defenses, and certification.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Preset Selection: Choose from 5 publication-grade classic investigations with deliberate methodological vulnerabilities or construct your own custom design.',
        'Audit Investigation: Summon The Skeptic to generate 3 sharp, targeted peer review challenges across falsifiability, variable isolation, controls, and error sources.',
        'Draft Defense: Write targeted responses to each challenge, detailing specific protocol amendments, negative controls, or calibration procedures.',
        'Submit Defense: Have the AI review board evaluate your arguments and calculate your Methodological Rigor Score.',
        'Export Memorandum: Download a formatted Markdown peer review audit for your laboratory notebook or instructor submission.',
        'Reset Session: Clear rebuttals and verdicts to practice alternative defense strategies or load a different experimental setup.',
      ],
    },
    {
      icon: 'flask',
      title: 'Things to Try',
      bullets: true,
      items: [
        'Fix Thermal Expansion in Enzyme Kinetics: Account for Charles Law and water vapor pressure when measuring gas displacement across varying temperatures.',
        'Address Matrix Mismatch in Spectrophotometry: Explain why a pure water blank fails in high-concentration alkali kinetics and how a matrix blank resolves it.',
        'Resolve Video Frame Artifacts in Free Fall: Propose solutions for smartphone rolling shutter distortion and parallax error when tracking falling masses.',
        'Isolate Infrared Radiation in Photosynthesis: Design a water-jacket heat filter to decouple radiant heat from photon irradiance in Elodea assays.',
        'Account for Liquid Junction Potentials: Modify salt bridge chemistry to minimize boundary diffusion potentials in non-standard electrochemical cells.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Key Concepts',
      bullets: true,
      items: [
        'Peer Review & Falsifiability: True scientific hypotheses must make specific, disprovable predictions rather than accommodating any observational outcome.',
        'Internal Validity: The degree to which an observed effect can be confidently attributed solely to the independent variable without confounding artifacts.',
        'Positive and Negative Controls: Negative controls confirm that the baseline system does not produce the effect spontaneously; positive controls verify that the detector functions when the effect is present.',
        'Systematic vs. Random Error: Systematic errors consistently shift measurements in one direction (e.g. calibration offsets, uncorrected thermal expansion); random errors produce scatter around the mean.',
        'Constructive Skepticism: Rigorous scientific advancement depends not on proving oneself right, but on systematically testing and attempting to disprove alternative explanations.',
      ],
    },
  ],
};
