import { Flashcard } from '../../types';

export interface OcclusionDeckPreset {
  id: string;
  title: string;
  course: string;
  topic: string;
  cards: Flashcard[];
}

export const OCCLUSION_PRESETS: OcclusionDeckPreset[] = [
  {
    id: 'deck-cell-organelles',
    title: 'Cellular Ultrastructure & Organelles',
    course: 'AP Biology',
    topic: 'Cell Structure & Function',
    cards: [
      {
        id: 'occ-cell-1',
        type: 'image_occlusion',
        term: 'Identify the double-membrane power plant that generates ATP via chemiosmosis [Mask #1].',
        definition: 'Mitochondria',
        context: 'Mitochondria possess an outer membrane, folded inner cristae, and matrix containing Krebs cycle enzymes and mitochondrial DNA.',
        occlusionViewBox: '0 0 600 380',
        occlusionSvg: `
          <!-- Cell Membrane Outline -->
          <ellipse cx="300" cy="190" rx="280" ry="170" fill="#f8fafc" stroke="#334155" stroke-width="4" />
          <!-- Nucleus -->
          <circle cx="210" cy="190" r="75" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3" />
          <circle cx="210" cy="190" r="30" fill="#c7d2fe" stroke="#4338ca" stroke-width="2" />
          <!-- Rough ER -->
          <path d="M 285 160 Q 330 140 370 170 T 360 220" fill="none" stroke="#0ea5e9" stroke-width="5" />
          <!-- Mitochondria -->
          <g id="mitochondria-elem">
            <ellipse cx="440" cy="140" rx="45" ry="24" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
            <path d="M 405 140 Q 420 130 435 140 T 465 140" fill="none" stroke="#d97706" stroke-width="2" />
          </g>
          <!-- Golgi Apparatus -->
          <path d="M 380 250 Q 420 240 450 260 M 385 265 Q 425 255 455 275" fill="none" stroke="#10b981" stroke-width="4" />
          <!-- Lysosome -->
          <circle cx="160" cy="290" r="18" fill="#fce7f3" stroke="#db2777" stroke-width="2" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 380, y: 110, width: 120, height: 60, label: 'Mitochondria', isTarget: true },
          { id: 'm2', x: 150, y: 160, width: 120, height: 60, label: 'Nucleus', isTarget: false },
          { id: 'm3', x: 370, y: 235, width: 110, height: 50, label: 'Golgi Apparatus', isTarget: false },
        ],
      },
      {
        id: 'occ-cell-2',
        type: 'image_occlusion',
        term: 'Identify the membrane-bound organelle that packages, sorts, and modifies proteins [Mask #2].',
        definition: 'Golgi Apparatus',
        context: 'The Golgi apparatus consists of flattened cisternae with cis and trans faces receiving vesicles from the endoplasmic reticulum.',
        occlusionViewBox: '0 0 600 380',
        occlusionSvg: `
          <ellipse cx="300" cy="190" rx="280" ry="170" fill="#f8fafc" stroke="#334155" stroke-width="4" />
          <circle cx="210" cy="190" r="75" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3" />
          <circle cx="210" cy="190" r="30" fill="#c7d2fe" stroke="#4338ca" stroke-width="2" />
          <path d="M 285 160 Q 330 140 370 170 T 360 220" fill="none" stroke="#0ea5e9" stroke-width="5" />
          <ellipse cx="440" cy="140" rx="45" ry="24" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
          <path d="M 380 250 Q 420 240 450 260 M 385 265 Q 425 255 455 275" fill="none" stroke="#10b981" stroke-width="4" />
          <circle cx="160" cy="290" r="18" fill="#fce7f3" stroke="#db2777" stroke-width="2" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 380, y: 110, width: 120, height: 60, label: 'Mitochondria', isTarget: false },
          { id: 'm2', x: 360, y: 235, width: 130, height: 60, label: 'Golgi Apparatus', isTarget: true },
          { id: 'm3', x: 150, y: 160, width: 120, height: 60, label: 'Nucleus', isTarget: false },
        ],
      },
      {
        id: 'occ-cell-3',
        type: 'image_occlusion',
        term: 'Identify the genetic command center that houses chromatin and the nucleolus [Mask #3].',
        definition: 'Nucleus',
        context: 'The nucleus contains genomic DNA enclosed within a double-membrane nuclear envelope perforated with nuclear pores.',
        occlusionViewBox: '0 0 600 380',
        occlusionSvg: `
          <ellipse cx="300" cy="190" rx="280" ry="170" fill="#f8fafc" stroke="#334155" stroke-width="4" />
          <circle cx="210" cy="190" r="75" fill="#e0e7ff" stroke="#4f46e5" stroke-width="3" />
          <circle cx="210" cy="190" r="30" fill="#c7d2fe" stroke="#4338ca" stroke-width="2" />
          <path d="M 285 160 Q 330 140 370 170 T 360 220" fill="none" stroke="#0ea5e9" stroke-width="5" />
          <ellipse cx="440" cy="140" rx="45" ry="24" fill="#fef3c7" stroke="#d97706" stroke-width="2.5" />
          <path d="M 380 250 Q 420 240 450 260 M 385 265 Q 425 255 455 275" fill="none" stroke="#10b981" stroke-width="4" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 140, y: 150, width: 140, height: 80, label: 'Nucleus', isTarget: true },
          { id: 'm2', x: 380, y: 110, width: 120, height: 60, label: 'Mitochondria', isTarget: false },
        ],
      },
    ],
  },
  {
    id: 'deck-cardiac-circulatory',
    title: 'Cardiac Anatomy & Systemic Chambers',
    course: 'Anatomy and Physiology',
    topic: 'Cardiovascular System',
    cards: [
      {
        id: 'occ-card-1',
        type: 'image_occlusion',
        term: 'Identify the muscular systemic pumping chamber with the thickest myocardial wall [Mask #1].',
        definition: 'Left Ventricle',
        context: 'The left ventricle pumps oxygenated blood under high systemic pressure through the aortic semilunar valve into the ascending aorta.',
        occlusionViewBox: '0 0 600 400',
        occlusionSvg: `
          <!-- Heart Base Contour -->
          <path d="M 300 370 C 150 280 120 140 220 90 C 270 65 300 110 300 110 C 300 110 330 65 380 90 C 480 140 450 280 300 370 Z" fill="#fee2e2" stroke="#dc2626" stroke-width="4" />
          <!-- Septum -->
          <path d="M 300 170 L 300 360" stroke="#b91c1c" stroke-width="8" />
          <!-- Right Atrium -->
          <ellipse cx="230" cy="150" rx="40" ry="30" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
          <!-- Left Atrium -->
          <ellipse cx="370" cy="150" rx="40" ry="30" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
          <!-- Right Ventricle -->
          <ellipse cx="230" cy="270" rx="50" ry="40" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
          <!-- Left Ventricle -->
          <ellipse cx="370" cy="270" rx="55" ry="45" fill="#fecaca" stroke="#b91c1c" stroke-width="5" />
          <!-- Aorta Arch Top -->
          <path d="M 280 90 C 280 40 370 40 370 80" fill="none" stroke="#ef4444" stroke-width="12" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 320, y: 240, width: 110, height: 60, label: 'Left Ventricle', isTarget: true },
          { id: 'm2', x: 170, y: 240, width: 110, height: 60, label: 'Right Ventricle', isTarget: false },
          { id: 'm3', x: 270, y: 20, width: 110, height: 50, label: 'Aorta', isTarget: false },
        ],
      },
      {
        id: 'occ-card-2',
        type: 'image_occlusion',
        term: 'Identify the largest systemic artery arching superiorly from the base of the heart [Mask #2].',
        definition: 'Aorta',
        context: 'The aorta distributes oxygenated blood from the left ventricle throughout the entire systemic arterial circulation.',
        occlusionViewBox: '0 0 600 400',
        occlusionSvg: `
          <path d="M 300 370 C 150 280 120 140 220 90 C 270 65 300 110 300 110 C 300 110 330 65 380 90 C 480 140 450 280 300 370 Z" fill="#fee2e2" stroke="#dc2626" stroke-width="4" />
          <path d="M 300 170 L 300 360" stroke="#b91c1c" stroke-width="8" />
          <ellipse cx="230" cy="150" rx="40" ry="30" fill="#dbeafe" stroke="#2563eb" stroke-width="2" />
          <ellipse cx="370" cy="150" rx="40" ry="30" fill="#fee2e2" stroke="#dc2626" stroke-width="2" />
          <ellipse cx="230" cy="270" rx="50" ry="40" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="2" />
          <ellipse cx="370" cy="270" rx="55" ry="45" fill="#fecaca" stroke="#b91c1c" stroke-width="5" />
          <path d="M 280 90 C 280 40 370 40 370 80" fill="none" stroke="#ef4444" stroke-width="12" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 260, y: 20, width: 130, height: 50, label: 'Aorta', isTarget: true },
          { id: 'm2', x: 320, y: 240, width: 110, height: 60, label: 'Left Ventricle', isTarget: false },
        ],
      },
    ],
  },
  {
    id: 'deck-galvanic-cell',
    title: 'Galvanic Electrochemical Cell Schematic',
    course: 'AP Chemistry',
    topic: 'Electrochemistry',
    cards: [
      {
        id: 'occ-galv-1',
        type: 'image_occlusion',
        term: 'Identify the ionic pathway maintaining electrical neutrality between half-cells [Mask #1].',
        definition: 'Salt Bridge',
        context: 'The salt bridge contains an inert electrolyte (e.g. KNO3) allowing ions to migrate and neutralize charge buildup without mixing solutions.',
        occlusionViewBox: '0 0 600 350',
        occlusionSvg: `
          <!-- Left Beaker (Anode) -->
          <rect x="100" y="140" width="140" height="150" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="3" />
          <rect x="135" y="100" width="24" height="120" fill="#94a3b8" stroke="#475569" stroke-width="2" />
          <!-- Right Beaker (Cathode) -->
          <rect x="360" y="140" width="140" height="150" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="3" />
          <rect x="440" y="100" width="24" height="120" fill="#f97316" stroke="#c2410c" stroke-width="2" />
          <!-- Salt Bridge Inverted U-tube -->
          <path d="M 190 190 V 90 H 410 V 190" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round" />
          <!-- Voltmeter -->
          <circle cx="300" cy="60" r="24" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
          <path d="M 147 100 V 60 H 276 M 324 60 H 452 V 100" fill="none" stroke="#1e293b" stroke-width="2" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 230, y: 70, width: 140, height: 40, label: 'Salt Bridge', isTarget: true },
          { id: 'm2', x: 100, y: 75, width: 90, height: 40, label: 'Zinc Anode', isTarget: false },
          { id: 'm3', x: 410, y: 75, width: 100, height: 40, label: 'Copper Cathode', isTarget: false },
        ],
      },
      {
        id: 'occ-galv-2',
        type: 'image_occlusion',
        term: 'Identify the electrode where oxidation spontaneously occurs (electrons released) [Mask #2].',
        definition: 'Anode',
        context: 'At the zinc anode, Zn(s) oxidizes to Zn2+(aq) + 2e-, releasing electrons into the external circuit toward the cathode.',
        occlusionViewBox: '0 0 600 350',
        occlusionSvg: `
          <rect x="100" y="140" width="140" height="150" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="3" />
          <rect x="135" y="100" width="24" height="120" fill="#94a3b8" stroke="#475569" stroke-width="2" />
          <rect x="360" y="140" width="140" height="150" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="3" />
          <rect x="440" y="100" width="24" height="120" fill="#f97316" stroke="#c2410c" stroke-width="2" />
          <path d="M 190 190 V 90 H 410 V 190" fill="none" stroke="#f59e0b" stroke-width="14" stroke-linecap="round" />
          <circle cx="300" cy="60" r="24" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
          <path d="M 147 100 V 60 H 276 M 324 60 H 452 V 100" fill="none" stroke="#1e293b" stroke-width="2" />
        `,
        occlusionMasks: [
          { id: 'm1', x: 90, y: 70, width: 110, height: 45, label: 'Anode', isTarget: true },
          { id: 'm2', x: 230, y: 70, width: 140, height: 40, label: 'Salt Bridge', isTarget: false },
          { id: 'm3', x: 410, y: 70, width: 110, height: 45, label: 'Cathode', isTarget: false },
        ],
      },
    ],
  },
];
