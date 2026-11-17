import { SimulationAboutContent } from '../shared/AboutPanel';

export const BLOOD_BUFFER_ABOUT: SimulationAboutContent = {
  title: 'Bicarbonate Blood Buffer System',
  summary:
    'Explore how reversible chemical equilibrium, Le Chatelier shifts, and respiratory-metabolic feedback loops maintain human arterial blood pH in the narrow homeostatic corridor of 7.35 to 7.45.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Arterial Blood pH Gauge:</strong> A clinical dial tracking arterial pH in real time. The green center zone marks healthy homeostasis (7.35 to 7.45); the red left zone flags acidosis (pH < 7.35); the violet right zone flags alkalosis (pH > 7.45).',
        '<strong>Bicarbonate Buffer Equilibrium:</strong> Shows the reversible cascade: CO₂(g, lungs) ⇄ CO₂(aq) + H₂O ⇄ H₂CO₃ ⇄ H⁺ + HCO₃⁻ (kidneys). Dynamic glowing arrows reveal the direction of the Le Chatelier shift.',
        '<strong>Clinical Status Badges:</strong> Alerts reporting physiological state, from normal homeostasis to critical acidosis or alkalosis.',
        '<strong>Buffer Dampening Comparison:</strong> Compares physiological buffered blood directly against unbuffered saline under identical acid loads.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Respiratory Rate Slider (bpm):</strong> Controls minute ventilation. Normal resting rate is 12 to 16 breaths per minute. Breathing slowly (<10 bpm) traps CO₂; hyperventilating (>20 bpm) blows off CO₂.',
        '<strong>Metabolic Disturbances (+/- Acid):</strong> Inject metabolic fixed acids (modeling diabetic ketoacidosis or lactic acidosis) or administer bicarbonate base.',
        '<strong>Rebreathing Mask:</strong> Traps expired carbon dioxide in a closed circuit, elevating arterial PCO₂ to rescue acute hyperventilation alkalosis.',
        '<strong>Buffer Toggle:</strong> Switch off the carbonic acid-bicarbonate buffer to see how wildly unbuffered saline swings with tiny acid additions.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Observe respiratory compensation:</strong> Add +4 metabolic acid (simulating DKA). Notice the pH plunges into acidosis (7.24). Now increase the Respiratory Rate to 27 bpm: hyperventilation blows off CO₂, pulling equilibrium left and restoring pH to 7.40.',
        '<strong>Simulate a panic attack:</strong> Set the Respiratory Rate to 32 bpm without adding acid. Blood pH climbs into severe alkalosis (7.62). Toggle the Rebreathing Mask to trap exhaled CO₂ and watch pH rapidly normalize.',
        '<strong>Test buffer dampening:</strong> At baseline (pH 7.40), turn off the Bicarbonate Buffer. Add just one unit of acid and watch unbuffered pH crash straight below 6.8.',
        '<strong>Observe hypoventilation acidosis:</strong> Set Respiratory Rate to 5 bpm (modeling opioid respiratory depression). Trapped CO₂ pushes equilibrium right, releasing H⁺ and producing respiratory acidosis.',
        '<strong>Compensate for gastric acid loss:</strong> Add -4 base (simulating prolonged vomiting). Slow the breathing rate to 5 bpm to trap metabolic CO₂ and watch the resulting carbonic acid restore pH to 7.45.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Homeostatic pH corridor:</strong> Human arterial blood must stay strictly between 7.35 and 7.45. Protein tertiary structure, membrane excitability, and cardiac function fail outside 6.8 to 7.8.',
        '<strong>Le Chatelier\'s principle:</strong> When an equilibrium system experiences a disturbance, it shifts in whichever direction relieves the applied stress.',
        '<strong>Respiratory regulation:</strong> Rapid ventilation eliminates volatile CO₂, pulling equilibrium to the left and consuming H⁺ ions. Slow breathing traps CO₂, generating H⁺.',
        '<strong>Metabolic regulation:</strong> Renal and hepatic mechanisms regulate non-volatile fixed acids and adjust bicarbonate reabsorption or excretion over hours to days.',
        '<strong>Henderson-Hasselbalch relationship:</strong> pH = 6.1 + log([HCO₃⁻] / [0.03 · PCO₂]). Maintaining a 20:1 ratio of bicarbonate base to dissolved carbon dioxide anchors healthy arterial blood at pH 7.40.',
      ],
    },
  ],
};
