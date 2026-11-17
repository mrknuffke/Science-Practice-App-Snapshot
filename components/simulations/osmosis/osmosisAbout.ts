import { SimulationAboutContent } from '../shared/AboutPanel';

export const OSMOSIS_ABOUT: SimulationAboutContent = {
  title: 'Osmosis Lab',
  summary:
    'A bag of sugar water sits in a beaker, with a glass tube rising out of the top. Water crosses the bag wall in both directions. Watch the tube to see which way wins, and why it eventually stops. Adapted from an original simulation by Ms. Michelle Lee, SAS General Biology.',
  sections: [
    {
      icon: 'book',
      title: 'What Am I Looking At?',
      bullets: true,
      items: [
        '<strong>The osmometer:</strong> The bag is dialysis tubing tied around a glass tube. Liquid in the tube rises when water enters the bag and falls when water leaves it.',
        '<strong>Orange tint:</strong> Darker orange means more dissolved sugar. Pale blue means nearly pure water.',
        '<strong>Blue arrows:</strong> Show which way water is moving overall across the bag wall.',
        '<strong>Height graph:</strong> Plots the column height over time. After a reset, your last run stays on the graph as a dashed line.',
        '<strong>Tug-of-war bar:</strong> Two things decide the flow. The sugar difference moves water toward the sugary side. The weight of the column pushes water back out of the bag.',
        '<strong>Close-up of the bag wall:</strong> Small blue dots are water. Big orange dots are sugar. Water fits through the pores. Sugar does not, unless you pick the leaky membrane.',
      ],
    },
    {
      icon: 'sliders',
      title: 'How to Explore',
      bullets: true,
      items: [
        '<strong>Sugar in the bag and Sugar in the beaker:</strong> Set each from 0 M (pure water) to 1.0 M. Changing the bag starts a new run. You can change the beaker mid-run, like moving the bag to a new beaker.',
        '<strong>Tube:</strong> Narrow, medium or wide. Changing it starts a new run.',
        '<strong>Membrane:</strong> The perfect membrane lets only water through. The leaky membrane acts like real dialysis tubing and lets sugar escape slowly.',
        '<strong>Start, Pause, Reset:</strong> The sim starts paused so you can predict first. Reset clears the run and keeps it on the graph for comparison.',
        '<strong>Speed:</strong> 1×, 5× or 20×. Use 20× to see where a run ends up.',
        '<strong>Challenges:</strong> Five tasks that each check your setup in the sim.',
      ],
    },
    {
      icon: 'lightbulb',
      title: 'Things to Try',
      bullets: true,
      items: [
        '<strong>Predict the direction:</strong> Before you press Start, decide whether the column will rise or fall. A 0.8 M bag in pure water rises. A 0 M bag in 0.6 M sugar falls.',
        '<strong>Find the stop:</strong> Run a 1.0 M bag in pure water at 20×. The column levels off near 94 mm. The close-up still shows water crossing both ways, in about equal numbers.',
        '<strong>Double the sugar:</strong> Compare a 0.5 M bag with a 1.0 M bag. The final height roughly doubles.',
        '<strong>Match the two sides:</strong> Set both to 0.5 M. Nothing happens to the column, even though water keeps crossing.',
        '<strong>Race the tubes:</strong> Run the same solutions with the wide tube, then the narrow one. The narrow tube climbs about nine times faster.',
        '<strong>Move the bag:</strong> Let a 1.0 M bag climb for a while, then raise the beaker to 1.0 M. The column turns around and falls.',
        '<strong>Leak the sugar:</strong> Pick the leaky membrane. The column climbs, peaks, then slides back toward the start.',
      ],
    },
    {
      icon: 'flask',
      title: 'Key Concepts',
      bullets: true,
      items: [
        '<strong>Osmosis:</strong> The net movement of water across a membrane that blocks the dissolved particles. Water moves from the side with less dissolved solute to the side with more.',
        '<strong>Sugar does not pull water.</strong> Every water molecule moves at random. Dissolved sugar takes up room, so fewer water molecules reach the pores from the sugary side. More water arrives from the other side, so more crosses that way.',
        '<strong>Hypotonic, hypertonic, isotonic:</strong> These compare the beaker to the bag. A hypotonic beaker has less solute than the bag, so water moves in. A hypertonic beaker has more, so water moves out. Isotonic means equal, so there is no net flow.',
        '<strong>Pressure pushes back:</strong> A taller column presses down on the bag. That pressure pushes water out. The column stops when this push equals the osmotic drive. Plant cells use the same balance: water presses the cell against its wall, which is turgor pressure.',
        '<strong>A model, scaled down:</strong> A real 1 M sugar difference could hold up a column of water hundreds of metres tall. This sim shrinks that so the column levels off inside the tube. The pattern is real. The heights are scaled.',
      ],
    },
  ],
};
