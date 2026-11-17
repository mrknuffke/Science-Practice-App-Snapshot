import { SimulationAboutContent } from '../shared/AboutPanel';

export const FBD_ABOUT: SimulationAboutContent = {
  title: 'Free Body Diagrams',
  summary: 'Build and analyze free body diagrams to visualize all external forces acting on an object, break vectors into components, and determine net force.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      items: [
        '<strong>Object (dot, block, or sphere):</strong> Represents the object in isolation, ignoring internal structure.',
        '<strong>Force arrows:</strong> Each arrow shows the direction and relative strength of one external push or pull.',
        '<strong>Force label:</strong> The symbol next to each arrow (Fg, Fn, Fa, Ff, etc.) identifies the physical origin of the force.',
        '<strong>Net force vector (dashed arrow):</strong> The vector sum of all placed forces, showing the direction of acceleration.',
        '<strong>Component table:</strong> Breaks every force into horizontal (Fx) and vertical (Fy) components to verify balance.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      items: [
        '<strong>Add a force:</strong> Click a force in the palette to place it at the center of the object.',
        '<strong>Rotate an arrow:</strong> Drag the arrowhead around the circle, or type an exact angle in degrees.',
        '<strong>Resize an arrow:</strong> Drag the arrow tail, or type the exact force in Newtons into the editor.',
        '<strong>Select or delete:</strong> Click any arrow to edit its properties. Press Backspace or Delete to remove it.',
        '<strong>Build Mode:</strong> Free-form canvas where you can build any force combination and tilt the ramp angle.',
        '<strong>Practice Mode:</strong> Pick a scenario, place the forces, and click "Check My FBD" for instant feedback.',
        '<strong>Reveal Solution:</strong> Overlays the target force vectors in blue so you can compare your reasoning.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      items: [
        'Place gravity (270°) and normal force (90°) on a block. Confirm the net force is zero, then tilt the ramp to see how the normal force shifts.',
        'In Practice Mode, try "Block Pushed with Friction" and deliberately point friction the wrong way to see how the checker catches the error.',
        'Set up a large forward push and small friction. Watch the dashed net-force vector reveal the acceleration direction.',
        'Test "Skydiver at Terminal Velocity." Set upward drag equal to downward gravity and observe the net force vanish.',
        'Switch to the Atwood Machine scenario and adjust tension until the net force flips direction.',
        'Build a custom 4-force equilibrium: when horizontal and vertical forces cancel out, the net force arrow disappears.',
        'Try the electric force on a charged particle between plates for electrostatics practice.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      items: [
        '<strong>Free Body Diagram:</strong> A diagram showing only the chosen object and the external forces acting on it.',
        '<strong>Newton\'s First Law:</strong> When net force equals zero, the object is in equilibrium: motionless or moving at constant velocity.',
        '<strong>Newton\'s Second Law:</strong> Net force equals mass times acceleration (ΣF = ma). Acceleration always points in the direction of net force.',
        '<strong>Vector Components:</strong> Every force at angle θ breaks down into Fx = F cos(θ) and Fy = F sin(θ). Summing each axis separately gives net force.',
        '<strong>Normal Force:</strong> Normal means perpendicular. The support force always pushes straight out from the surface, not always straight up.',
        '<strong>Friction:</strong> Always acts parallel to the contact surface, opposing sliding motion (kinetic) or the urge to slide (static).',
      ],
    },
  ],
};
