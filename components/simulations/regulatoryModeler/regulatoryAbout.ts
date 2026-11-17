import { SimulationAboutContent } from '../shared/AboutPanel';

export const REGULATORY_ABOUT: SimulationAboutContent = {
  title: 'Regulatory Interactions Modeler',
  summary:
    'Build and test biological circuits in real time. Wire genes, proteins, and environmental signals with activation or repression edges to see how molecular networks produce homeostasis, switches, and oscillations.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>Nodes</strong>: Biological players in the network. Each node displays an activation level from 0% to 100%.',
        '<strong>Genes (rectangles)</strong>: Start inactive; turn on when incoming activation overcomes repression and natural decay.',
        '<strong>Proteins (circles)</strong>: Transcription factors, enzymes, or signaling molecules produced downstream of genes.',
        '<strong>Signals (diamonds)</strong>: Interactive toggles you can click to switch inputs on or off during an experiment.',
        '<strong>Environment (hexagons)</strong>: External conditions (like temperature, nutrients, or toxins) influencing downstream nodes.',
        '<strong>Green arrows (→)</strong>: Activating connections: the source node drives the target node toward higher expression.',
        '<strong>Red blunt bars (⊣)</strong>: Repressive connections: the source node drives the target node toward lower expression.',
        '<strong>Activity Graph</strong>: Real-time multi-channel oscilloscope tracking every node\'s expression percentage over time.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Build',
      bullets: true,
      items: [
        '<strong>Add nodes</strong>: Click any node palette button (Gene, Protein, Signal, Environment) to drop it onto the grid.',
        '<strong>Wire connections</strong>: Select a source node, click "Activate" or "Repress" in the Connections card, and click the destination node. Press <kbd>Esc</kbd> anytime to cancel.',
        '<strong>Connection strength</strong>: Click any connection line to highlight it, then adjust its strength slider from 0 to 1. Higher strength exerts stronger regulatory pull.',
        '<strong>Decay rate</strong>: Global dial setting how quickly active nodes lose expression when incoming signals turn off. Lower decay keeps signals lingering longer.',
        '<strong>Toggle inputs</strong>: Click any diamond Signal or hexagon Environment node mid-run to simulate adding or removing an external ligand.',
        '<strong>Load starter circuits</strong>: Choose pre-wired motifs from the dropdown, including Simple Induction, Negative Feedback, and Feed-Forward Loops.',
        '<strong>Delete a node</strong>: Click any node to select it, then press Delete or tap the trash icon.',
        '<strong>Play, Pause, and Reset</strong>: Control the clock and zero out activations while keeping your circuit diagram intact.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Observe simple induction:</strong> Load the Simple Activation starter circuit. Toggle the upstream Signal on and off. Notice how the target gene responds with a realistic delay.',
        '<strong>Create a homeostatic oscillator:</strong> Wire Signal → Gene → Protein → (repress) Gene. Hit play: does the protein level stabilize into an equilibrium plateau or oscillate rhythmically?',
        '<strong>Build a double-negative switch:</strong> Wire Signal → (repress) Repressor Protein → (repress) Target Gene. Show that inhibiting an inhibitor results in net gene expression.',
        '<strong>Tune the decay clock:</strong> Set up a negative feedback loop and drag the decay slider. How does protein breakdown rate change the wave frequency?',
        '<strong>Compare input weights:</strong> Wire two activating inputs into a single target gene: set one at strength 0.2 and the other at 1.0. How does the target respond when you toggle each input separately versus together?',
        '<strong>Test a feed-forward motif:</strong> Connect A → B → C and simultaneously add an edge from A → C. Test whether C responds faster to a sudden pulse of A than with the single path alone.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Gene Regulation:</strong> Cells precisely control which genes are expressed in response to internal metabolic needs and external environmental cues.',
        '<strong>Transcription Factors:</strong> Regulatory proteins that bind regulatory DNA sequences to stimulate or repress RNA polymerase activity.',
        '<strong>Negative Feedback:</strong> A control mechanism where an output inhibits its own production, maintaining homeostatic set points or generating biological clocks.',
        '<strong>Signal Transduction:</strong> Cascades of biochemical modifications that transmit information from cell-surface receptors to nuclear transcription factors.',
        '<strong>Degradation & Turnover:</strong> Continuous enzymatic breakdown of mRNAs and proteins ensures regulatory states remain reversible once upstream signals cease.',
        '<strong>Biological Logic Gates:</strong> Combinatorial promoter architectures that evaluate multiple inputs simultaneously as biological AND, OR, and NOT gates.',
      ],
    },
  ],
};

