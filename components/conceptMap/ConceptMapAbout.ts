import { SimulationAboutContent } from '../simulations/shared/AboutPanel';

export const CONCEPT_MAP_ABOUT: SimulationAboutContent = {
  title: 'Concept Map Builder',
  summary: 'A relational scientific workspace where students organize concepts into interconnected networks of meaning by defining directional, proposition-based relationships.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        'Interactive Infinite Canvas: A responsive visual canvas displaying draggable concept cards and labeled relationship arrows.',
        'Concept Nodes: Encapsulated scientific terms categorized by role (e.g. Pathways, Molecules, Forces, Organelles, Quantities).',
        'Directional Vectors: Curved connection arrows pointing from cause/substrate to effect/product.',
        'Linking Phrases: Explicit relational verbs (e.g., "catalyzes", "requires", "produces", "inhibits") situated at the midpoint of each vector.',
        'Validation Badges: Color-coded indicators indicating whether each proposition is scientifically sound, inverted, or in need of precision.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        'Connecting Nodes: Click the connection pin on any concept card and drag to a target node to establish a directed arrow.',
        'Editing Relationships: Click any arrow pill to choose from common scientific linking phrases or type a custom descriptor.',
        'Adding Custom Concepts: Click "+ Add Custom Node" in the toolbar to introduce any scientific term not present in the preset bank.',
        'Auto-Arrange Layout: Click "Circle Layout" or "Organize" to automatically space nodes and untangle overlapping vectors.',
        'Evaluate Map: Runs propositional validation against canonical scientific relationships or AI semantic reasoning.',
        'Export Options: Download high-resolution Markdown reports, Mermaid diagram definitions, or JSON schemas.',
      ],
    },
    {
      icon: 'flask',
      title: 'Things to Try',
      bullets: true,
      items: [
        'Test Directional Inversion: Try linking Glucose -> produces -> Photosynthesis and observe how the validator flags the causality error.',
        'Map Coupled Bioenergetics: Connect Solar Radiance, Chloroplast, Glucose, Mitochondria, and ATP to reveal metabolic coupling.',
        'Build Bonding Hierarchies: Show how Electronegativity Difference dictates both Ionic Bonding and Molecular Dipoles.',
        'Construct Work-Energy Chains: Link Net Force to Work, Work to Kinetic Energy, and Kinetic Energy to Total Mechanical Energy.',
        'Model Feedback Inhibition: Create a negative feedback regulatory loop where high product concentration inhibits an initial enzyme.',
        'Explore Trophic 10% Dissipation: Trace how primary producers capture solar flux while releasing metabolic heat at every trophic step.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Key Concepts',
      bullets: true,
      items: [
        'Propositions: The fundamental units of meaning in cognitive science, consisting of two concepts joined by a linking word (A -> verb -> B).',
        'Hierarchical Organization: In meaningful learning, broader inclusive concepts subsume more specific subordinate ideas.',
        'Cross-Links: Connections between different conceptual domains that demonstrate integrative reconciliation and deep synthesis.',
        'Directionality: Arrows must reflect actual physical, temporal, or thermodynamic causality, not arbitrary association.',
        'Semantic Precision: Vague links like "relates to" obscure mechanistic understanding, while verbs like "catalyzes" or "inhibits" clarify scientific dynamics.',
      ],
    },
  ],
};
