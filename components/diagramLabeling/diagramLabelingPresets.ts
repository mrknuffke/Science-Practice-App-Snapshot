import { DiagramPreset } from './diagramLabelingTypes';

export const DIAGRAM_PRESETS: DiagramPreset[] = [
  {
    id: 'bio-chloroplast',
    title: 'Chloroplast Ultrastructure & Photophosphorylation',
    course: 'AP Biology',
    topic: 'Cellular Organelles & Photosynthesis',
    description: 'Identify the structural compartments that facilitate light-dependent proton pumping and the enzymatic Calvin cycle.',
    viewBox: '0 0 800 500',
    svgMarkup: `
      <!-- Outer Oval Envelope -->
      <ellipse cx="400" cy="250" rx="340" ry="190" fill="#ecfdf5" stroke="#059669" stroke-width="6" class="dark:fill-emerald-950/20 dark:stroke-emerald-500" />
      <!-- Inner Membrane -->
      <ellipse cx="400" cy="250" rx="320" ry="175" fill="#f0fdf4" stroke="#10b981" stroke-width="4" stroke-dasharray="8 4" class="dark:fill-emerald-900/10 dark:stroke-emerald-400" />

      <!-- Aqueous Stroma Base -->
      <rect x="150" y="160" width="500" height="180" rx="40" fill="none" opacity="0.1" />

      <!-- Granum Stack 1 (Left) -->
      <g id="granum-1">
        <ellipse cx="280" cy="210" rx="60" ry="14" fill="#047857" stroke="#065f46" stroke-width="2" />
        <ellipse cx="280" cy="230" rx="60" ry="14" fill="#059669" stroke="#065f46" stroke-width="2" />
        <ellipse cx="280" cy="250" rx="60" ry="14" fill="#10b981" stroke="#065f46" stroke-width="2" />
        <ellipse cx="280" cy="270" rx="60" ry="14" fill="#34d399" stroke="#065f46" stroke-width="2" />
        <ellipse cx="280" cy="290" rx="60" ry="14" fill="#059669" stroke="#065f46" stroke-width="2" />
      </g>

      <!-- Granum Stack 2 (Center) -->
      <g id="granum-2">
        <ellipse cx="450" cy="230" rx="65" ry="15" fill="#047857" stroke="#065f46" stroke-width="2" />
        <ellipse cx="450" cy="252" rx="65" ry="15" fill="#059669" stroke="#065f46" stroke-width="2" />
        <ellipse cx="450" cy="274" rx="65" ry="15" fill="#10b981" stroke="#065f46" stroke-width="2" />
        <ellipse cx="450" cy="296" rx="65" ry="15" fill="#34d399" stroke="#065f46" stroke-width="2" />
      </g>

      <!-- Granum Stack 3 (Right) -->
      <g id="granum-3">
        <ellipse cx="580" cy="220" rx="55" ry="13" fill="#047857" stroke="#065f46" stroke-width="2" />
        <ellipse cx="580" cy="240" rx="55" ry="13" fill="#059669" stroke="#065f46" stroke-width="2" />
        <ellipse cx="580" cy="260" rx="55" ry="13" fill="#10b981" stroke="#065f46" stroke-width="2" />
        <ellipse cx="580" cy="280" rx="55" ry="13" fill="#34d399" stroke="#065f46" stroke-width="2" />
      </g>

      <!-- Stroma Lamellae Connecting Tubes -->
      <path d="M 340 250 Q 380 240 385 252" fill="none" stroke="#059669" stroke-width="6" />
      <path d="M 515 260 Q 535 250 545 250" fill="none" stroke="#059669" stroke-width="6" />

      <!-- Plastid DNA and Ribosomes in Stroma -->
      <path d="M 220 330 Q 235 320 250 335 T 280 330" fill="none" stroke="#0284c7" stroke-width="2" stroke-dasharray="3 2" />
      <circle cx="210" cy="280" r="3" fill="#475569" />
      <circle cx="230" cy="295" r="3" fill="#475569" />
      <circle cx="530" cy="330" r="3" fill="#475569" />
      <circle cx="560" cy="340" r="3" fill="#475569" />
    `,
    callouts: [
      {
        id: 'c1',
        number: 1,
        x: 170,
        y: 110,
        label: 'Outer Membrane',
        hint: 'Permeable lipid bilayer forming outer organelle perimeter',
        description: 'Smooth outer lipid bilayer containing porins for small molecule transit.',
        acceptableAnswers: ['Outer lipid membrane', 'External membrane'],
      },
      {
        id: 'c2',
        number: 2,
        x: 230,
        y: 145,
        label: 'Inner Membrane',
        hint: 'Selectively permeable barrier inside outer membrane',
        description: 'Highly regulated inner phospholipid bilayer enclosing the aqueous stroma.',
        acceptableAnswers: ['Internal membrane'],
      },
      {
        id: 'c3',
        number: 3,
        x: 620,
        y: 180,
        label: 'Stroma',
        hint: 'Fluid matrix containing Rubisco and Calvin cycle enzymes',
        description: 'Aqueous fluid where carbon dioxide fixation (Calvin Cycle) takes place.',
        acceptableAnswers: ['Chloroplast stroma', 'Fluid stroma'],
      },
      {
        id: 'c4',
        number: 4,
        x: 280,
        y: 200,
        label: 'Granum',
        hint: 'Stack of disc-like thylakoids',
        description: 'Column stack of thylakoid discs optimized for light absorption.',
        acceptableAnswers: ['Grana', 'Thylakoid stack', 'Granum stack'],
      },
      {
        id: 'c5',
        number: 5,
        x: 450,
        y: 274,
        label: 'Thylakoid Lumen',
        hint: 'Internal space where protons accumulate during light reactions',
        description: 'Internal acidic chamber where high H+ proton gradient builds during electron transport.',
        acceptableAnswers: ['Lumen', 'Thylakoid space', 'Intrathylakoid space'],
      },
      {
        id: 'c6',
        number: 6,
        x: 130,
        y: 220,
        label: 'Intermembrane Space',
        hint: 'Narrow compartment between outer and inner envelope layers',
        description: 'Fluid region separating the outer and inner boundary envelopes.',
        acceptableAnswers: ['Inter-membrane space'],
      },
    ],
  },
  {
    id: 'chem-galvanic-cell',
    title: 'Galvanic Electrochemical Cell (Zn-Cu)',
    course: 'AP Chemistry',
    topic: 'Electrochemistry & Redox Reactions',
    description: 'Trace the electron transfer vector, half-reaction electrodes, and ion balance across an operating battery.',
    viewBox: '0 0 800 500',
    svgMarkup: `
      <!-- Beaker 1 (Anode: Zinc, Left) -->
      <rect x="120" y="200" width="220" height="240" rx="16" fill="#f8fafc" stroke="#64748b" stroke-width="4" class="dark:fill-slate-800 dark:stroke-slate-600" />
      <rect x="124" y="260" width="212" height="176" rx="12" fill="#e0f2fe" opacity="0.6" class="dark:fill-sky-950/40" />

      <!-- Beaker 2 (Cathode: Copper, Right) -->
      <rect x="460" y="200" width="220" height="240" rx="16" fill="#f8fafc" stroke="#64748b" stroke-width="4" class="dark:fill-slate-800 dark:stroke-slate-600" />
      <rect x="464" y="260" width="212" height="176" rx="12" fill="#dbeafe" opacity="0.6" class="dark:fill-blue-950/40" />

      <!-- Zinc Electrode (Gray Anode) -->
      <rect x="180" y="140" width="40" height="220" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="3" />
      <!-- Copper Electrode (Orange Cathode) -->
      <rect x="580" y="140" width="40" height="220" rx="4" fill="#f97316" stroke="#c2410c" stroke-width="3" />

      <!-- Circuit Wire Connecting Electrodes -->
      <path d="M 200 140 L 200 90 L 370 90" fill="none" stroke="#334155" stroke-width="4" class="dark:stroke-slate-300" />
      <path d="M 430 90 L 600 90 L 600 140" fill="none" stroke="#334155" stroke-width="4" class="dark:stroke-slate-300" />

      <!-- Voltmeter Instrument Dial -->
      <circle cx="400" cy="90" r="32" fill="#ffffff" stroke="#7c3aed" stroke-width="4" class="dark:fill-slate-900" />
      <text x="400" y="94" font-size="13" font-weight="900" text-anchor="middle" fill="#7c3aed">+1.10V</text>

      <!-- Electron Flow Arrow Along Wire -->
      <path d="M 260 78 L 300 78" fill="none" stroke="#2563eb" stroke-width="3" marker-end="url(#arrow-blue)" />
      <text x="280" y="70" font-size="11" font-weight="bold" text-anchor="middle" fill="#2563eb">e⁻ flow</text>

      <!-- Inverted U-Tube Salt Bridge -->
      <path d="M 300 310 L 300 190 Q 300 170 330 170 L 470 170 Q 500 170 500 190 L 500 310" fill="none" stroke="#f1f5f9" stroke-width="28" stroke-linecap="round" class="dark:stroke-slate-700" />
      <path d="M 300 310 L 300 190 Q 300 170 330 170 L 470 170 Q 500 170 500 190 L 500 310" fill="none" stroke="#cbd5e1" stroke-width="20" stroke-linecap="round" class="dark:stroke-slate-600" />
      <!-- Cotton plugs in bridge -->
      <ellipse cx="300" cy="305" rx="9" ry="5" fill="#f8fafc" stroke="#94a3b8" />
      <ellipse cx="500" cy="305" rx="9" ry="5" fill="#f8fafc" stroke="#94a3b8" />
    `,
    callouts: [
      {
        id: 'c1',
        number: 1,
        x: 160,
        y: 130,
        label: 'Zinc Anode',
        hint: 'Site of oxidation where Zn loses electrons (negative electrode)',
        description: 'Negative electrode where zinc metal oxidizes: Zn(s) -> Zn2+(aq) + 2e-.',
        acceptableAnswers: ['Anode', 'Zinc electrode', 'Zn anode'],
      },
      {
        id: 'c2',
        number: 2,
        x: 640,
        y: 130,
        label: 'Copper Cathode',
        hint: 'Site of reduction where Cu2+ gains electrons (positive electrode)',
        description: 'Positive electrode where copper ions reduce: Cu2+(aq) + 2e- -> Cu(s).',
        acceptableAnswers: ['Cathode', 'Copper electrode', 'Cu cathode'],
      },
      {
        id: 'c3',
        number: 3,
        x: 400,
        y: 155,
        label: 'Salt Bridge',
        hint: 'Maintains electrical neutrality by supplying inert mobile ions',
        description: 'U-tube containing spectator electrolyte (e.g. KNO3) balancing charge build-up.',
        acceptableAnswers: ['KNO3 bridge', 'Ion bridge'],
      },
      {
        id: 'c4',
        number: 4,
        x: 400,
        y: 45,
        label: 'Voltmeter',
        hint: 'Instrument measuring electromotive force or cell potential',
        description: 'Measures standard electromotive force (E°cell = +1.10 V).',
        acceptableAnswers: ['Potentiometer', 'Voltage meter'],
      },
      {
        id: 'c5',
        number: 5,
        x: 280,
        y: 50,
        label: 'Electron Flow',
        hint: 'Direction electrons travel through external wire circuit',
        description: 'Spontaneous electron motion travels from anode to cathode.',
        acceptableAnswers: ['Electron direction', 'e- flow', 'External circuit flow'],
      },
      {
        id: 'c6',
        number: 6,
        x: 220,
        y: 380,
        label: 'Anode Electrolyte',
        hint: 'Aqueous solution containing zinc cations',
        description: 'Aqueous zinc sulfate (ZnSO4) solution bathing the zinc strip.',
        acceptableAnswers: ['Electrolyte solution', 'ZnSO4 solution', 'Zinc solution'],
      },
    ],
  },
  {
    id: 'phys-dc-circuit',
    title: 'Direct Current (DC) Circuit with Instrumentation',
    course: 'General Physics',
    topic: 'Electric Circuits & Ohm Law',
    description: 'Map series and parallel measurement instruments alongside sources and resistive loads.',
    viewBox: '0 0 800 500',
    svgMarkup: `
      <!-- Main Loop Wire Rect -->
      <rect x="160" y="100" width="480" height="300" rx="20" fill="none" stroke="#334155" stroke-width="4" class="dark:stroke-slate-300" />

      <!-- DC Battery (Left side of loop) -->
      <rect x="145" y="210" width="30" height="80" fill="#f8fafc" class="dark:fill-slate-900" />
      <line x1="130" y1="230" x2="190" y2="230" stroke="#0f172a" stroke-width="5" class="dark:stroke-slate-100" />
      <line x1="145" y1="245" x2="175" y2="245" stroke="#0f172a" stroke-width="8" class="dark:stroke-slate-100" />
      <line x1="130" y1="260" x2="190" y2="260" stroke="#0f172a" stroke-width="5" class="dark:stroke-slate-100" />
      <line x1="145" y1="275" x2="175" y2="275" stroke="#0f172a" stroke-width="8" class="dark:stroke-slate-100" />
      <text x="115" y="225" font-size="14" font-weight="900" fill="#ef4444">+</text>
      <text x="115" y="285" font-size="14" font-weight="900" fill="#3b82f6">-</text>

      <!-- Switch (Top wire) -->
      <rect x="330" y="90" width="60" height="20" fill="#f8fafc" class="dark:fill-slate-900" />
      <circle cx="335" cy="100" r="4" fill="#0f172a" class="dark:fill-slate-200" />
      <circle cx="385" cy="100" r="4" fill="#0f172a" class="dark:fill-slate-200" />
      <line x1="335" y1="100" x2="380" y2="82" stroke="#0f172a" stroke-width="4" class="dark:stroke-slate-200" />

      <!-- Series Ammeter (Top Right wire) -->
      <circle cx="520" cy="100" r="24" fill="#ffffff" stroke="#2563eb" stroke-width="3" class="dark:fill-slate-800" />
      <text x="520" y="106" font-size="16" font-weight="900" text-anchor="middle" fill="#2563eb">A</text>

      <!-- Load Resistor (Right wire) -->
      <rect x="625" y="200" width="30" height="100" fill="#f8fafc" class="dark:fill-slate-900" />
      <path d="M 640 200 L 652 210 L 628 225 L 652 240 L 628 255 L 652 270 L 628 285 L 640 300" fill="none" stroke="#d97706" stroke-width="4" />

      <!-- Parallel Voltmeter Loop (Outside Resistor) -->
      <path d="M 640 180 L 730 180 L 730 226" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="4 2" />
      <path d="M 640 320 L 730 320 L 730 274" fill="none" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="4 2" />
      <circle cx="730" cy="250" r="24" fill="#ffffff" stroke="#7c3aed" stroke-width="3" class="dark:fill-slate-800" />
      <text x="730" y="256" font-size="16" font-weight="900" text-anchor="middle" fill="#7c3aed">V</text>

      <!-- Current Flow Arrow -->
      <path d="M 230 88 L 270 88" fill="none" stroke="#ef4444" stroke-width="3" />
      <polygon points="270,84 280,88 270,92" fill="#ef4444" />
      <text x="255" y="80" font-size="11" font-weight="bold" text-anchor="middle" fill="#ef4444">I (Current)</text>
    `,
    callouts: [
      {
        id: 'c1',
        number: 1,
        x: 80,
        y: 250,
        label: 'DC Voltage Source',
        hint: 'Provides continuous electromotive force or potential difference',
        description: 'Direct current battery maintaining a constant potential difference.',
        acceptableAnswers: ['Battery', 'Voltage source', 'Power source', 'Cell'],
      },
      {
        id: 'c2',
        number: 2,
        x: 360,
        y: 50,
        label: 'Knife Switch',
        hint: 'Control element to open or close conductive path',
        description: 'Mechanical circuit breaker controlling current flow through the closed loop.',
        acceptableAnswers: ['Switch', 'Circuit switch'],
      },
      {
        id: 'c3',
        number: 3,
        x: 520,
        y: 45,
        label: 'Series Ammeter',
        hint: 'Instrument measuring current placed directly in-line with wire',
        description: 'Low-internal-resistance instrument measuring electric current in amperes.',
        acceptableAnswers: ['Ammeter', 'Current meter'],
      },
      {
        id: 'c4',
        number: 4,
        x: 590,
        y: 250,
        label: 'Load Resistor',
        hint: 'Electrical component converting electrical energy into heat',
        description: 'Ohmic resistor providing resistance (R) and dissipating electrical energy.',
        acceptableAnswers: ['Resistor', 'Load', 'Ohmic resistor'],
      },
      {
        id: 'c5',
        number: 5,
        x: 770,
        y: 250,
        label: 'Parallel Voltmeter',
        hint: 'High resistance instrument wired across two test points to measure potential drop',
        description: 'High-internal-resistance meter wired in parallel measuring potential difference.',
        acceptableAnswers: ['Voltmeter', 'Potential meter'],
      },
      {
        id: 'c6',
        number: 6,
        x: 255,
        y: 55,
        label: 'Conventional Current',
        hint: 'Direction positive charge would flow from high to low potential',
        description: 'Conventional flow points from positive battery terminal toward negative terminal.',
        acceptableAnswers: ['Current', 'Current vector', 'Electric current'],
      },
    ],
  },
  {
    id: 'phys-projectile-motion',
    title: '2D Projectile Trajectory & Vector Decomposition',
    course: 'AP Physics 1',
    topic: 'Two-Dimensional Kinematics',
    description: 'Decompose curved 2D gravitational trajectories into independent horizontal and vertical motions.',
    viewBox: '0 0 800 500',
    svgMarkup: `
      <!-- Ground Level Line -->
      <line x1="80" y1="420" x2="720" y2="420" stroke="#475569" stroke-width="4" />
      <pattern id="ground-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#94a3b8" stroke-width="2" />
      </pattern>
      <rect x="80" y="420" width="640" height="30" fill="url(#ground-hatch)" />

      <!-- Parabolic Trajectory Path -->
      <path d="M 120 420 Q 400 60 680 420" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="6 4" />

      <!-- Launch Position Ball & Vector -->
      <circle cx="120" cy="420" r="10" fill="#6366f1" stroke="#312e81" stroke-width="2" />
      <line x1="120" y1="420" x2="200" y2="300" stroke="#ec4899" stroke-width="4" />
      <polygon points="196,290 206,300 192,304" fill="#ec4899" />
      <text x="145" y="340" font-size="13" font-weight="900" fill="#ec4899">v₀</text>

      <!-- Intermediate Position Ball (Rising) -->
      <circle cx="260" cy="240" r="8" fill="#a5b4fc" />
      <!-- Vx horizontal component -->
      <line x1="260" y1="240" x2="330" y2="240" stroke="#059669" stroke-width="3" />
      <polygon points="328,236 338,240 328,244" fill="#059669" />
      <!-- Vy vertical component -->
      <line x1="260" y1="240" x2="260" y2="180" stroke="#0284c7" stroke-width="3" />
      <polygon points="256,182 260,172 264,182" fill="#0284c7" />

      <!-- Apex Ball (Maximum Height) -->
      <circle cx="400" cy="150" r="10" fill="#6366f1" stroke="#312e81" stroke-width="2" />
      <!-- Vx horizontal component at apex -->
      <line x1="400" y1="150" x2="470" y2="150" stroke="#059669" stroke-width="3.5" />
      <polygon points="468,146 478,150 468,154" fill="#059669" />
      <text x="440" y="140" font-size="12" font-weight="900" fill="#059669">vₓ = v₀ₓ</text>

      <!-- Gravity Vector Downward at Apex -->
      <line x1="400" y1="150" x2="400" y2="220" stroke="#f59e0b" stroke-width="3.5" />
      <polygon points="396,218 400,228 404,218" fill="#f59e0b" />
      <text x="415" y="210" font-size="12" font-weight="900" fill="#f59e0b">g (9.8 m/s²)</text>

      <!-- Landing Position Ball -->
      <circle cx="680" cy="420" r="10" fill="#6366f1" stroke="#312e81" stroke-width="2" />
    `,
    callouts: [
      {
        id: 'c1',
        number: 1,
        x: 80,
        y: 380,
        label: 'Launch Point',
        hint: 'Origin coordinates with initial velocity vector v0',
        description: 'Initial position where object is projected with initial speed and launch angle.',
        acceptableAnswers: ['Launch origin', 'Initial position', 'Origin'],
      },
      {
        id: 'c2',
        number: 2,
        x: 400,
        y: 105,
        label: 'Apex (Max Height)',
        hint: 'Peak trajectory point where vertical velocity instantaneous equals zero',
        description: 'Highest vertical position (H) where vertical velocity component vy momentarily equals 0.',
        acceptableAnswers: ['Apex', 'Maximum height', 'Peak', 'Top'],
      },
      {
        id: 'c3',
        number: 3,
        x: 520,
        y: 150,
        label: 'Horizontal Velocity Vx',
        hint: 'Constant velocity component along x-axis in absence of air resistance',
        description: 'Uniform horizontal velocity component that remains constant throughout free flight.',
        acceptableAnswers: ['Horizontal velocity', 'Vx', 'Horizontal vector'],
      },
      {
        id: 'c4',
        number: 4,
        x: 400,
        y: 250,
        label: 'Gravitational Acceleration',
        hint: 'Constant downward vector causing vertical parabolic curvature',
        description: 'Uniform downward acceleration (g = -9.8 m/s²) acting exclusively on vertical motion.',
        acceptableAnswers: ['Gravity', 'Acceleration g', 'Downward acceleration'],
      },
      {
        id: 'c5',
        number: 5,
        x: 710,
        y: 380,
        label: 'Impact Point (Range)',
        hint: 'Total horizontal distance traveled when landing at ground elevation',
        description: 'Final location where projectile returns to launch elevation, defining total range (R).',
        acceptableAnswers: ['Range', 'Landing point', 'Impact'],
      },
      {
        id: 'c6',
        number: 6,
        x: 260,
        y: 160,
        label: 'Vertical Velocity Vy',
        hint: 'Velocity component that decreases on ascent under downward gravity',
        description: 'Vertical velocity vector that diminishes on ascent, reaches zero at peak, and increases downward.',
        acceptableAnswers: ['Vertical velocity', 'Vy', 'Vertical vector'],
      },
    ],
  },
  {
    id: 'bio-nephron',
    title: 'Mammalian Nephron & Countercurrent Osmoregulation',
    course: 'Anatomy and Physiology',
    topic: 'Renal Physiology & Excretion',
    description: 'Trace blood filtration, solute reabsorption, and water conservation along functional kidney units.',
    viewBox: '0 0 800 500',
    svgMarkup: `
      <!-- Cortical / Medullary Boundary Line -->
      <line x1="80" y1="220" x2="720" y2="220" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 4" />
      <text x="100" y="210" font-size="11" font-weight="900" fill="#94a3b8" letter-spacing="1">RENAL CORTEX</text>
      <text x="100" y="240" font-size="11" font-weight="900" fill="#94a3b8" letter-spacing="1">RENAL MEDULLA</text>

      <!-- Bowman's Capsule Cup and Glomerulus Capillary Tuft -->
      <path d="M 230 110 C 180 110 180 190 230 190 C 260 190 270 170 280 150 C 270 130 260 110 230 110 Z" fill="#fef3c7" stroke="#d97706" stroke-width="3" class="dark:fill-amber-950/30" />
      <!-- Glomerulus inside -->
      <circle cx="215" cy="150" r="22" fill="#fee2e2" stroke="#dc2626" stroke-width="3" class="dark:fill-rose-950/40" />

      <!-- Proximal Convoluted Tubule (PCT) -->
      <path d="M 280 150 Q 320 120 340 160 T 380 140 T 400 180" fill="none" stroke="#f59e0b" stroke-width="12" stroke-linecap="round" />

      <!-- Loop of Henle (Descending & Ascending hairpin) -->
      <!-- Descending Limb (Thin) -->
      <path d="M 400 180 L 400 370 Q 400 400 420 400 L 440 400 Q 460 400 460 370" fill="none" stroke="#3b82f6" stroke-width="8" stroke-linecap="round" />
      <!-- Ascending Limb (Thick) -->
      <path d="M 460 370 L 460 180" fill="none" stroke="#2563eb" stroke-width="14" stroke-linecap="round" />

      <!-- Distal Convoluted Tubule (DCT) -->
      <path d="M 460 180 Q 490 130 520 160 T 560 140 T 600 160" fill="none" stroke="#8b5cf6" stroke-width="12" stroke-linecap="round" />

      <!-- Collecting Duct Trunk -->
      <path d="M 600 160 L 630 160 L 630 430" fill="none" stroke="#10b981" stroke-width="18" stroke-linecap="square" />
      <!-- Branch tributaries -->
      <path d="M 600 240 L 630 250" fill="none" stroke="#10b981" stroke-width="10" />
      <path d="M 600 320 L 630 330" fill="none" stroke="#10b981" stroke-width="10" />
    `,
    callouts: [
      {
        id: 'c1',
        number: 1,
        x: 180,
        y: 110,
        label: 'Glomerulus',
        hint: 'High pressure capillary knot where blood plasma is ultrafiltered',
        description: 'Tangle of fenestrated arterial capillaries where blood pressure drives ultrafiltration.',
        acceptableAnswers: ['Glomerular capillaries', 'Glomerular tuft'],
      },
      {
        id: 'c2',
        number: 2,
        x: 270,
        y: 75,
        label: "Bowman's Capsule",
        hint: 'Cup-like sac receiving filtrate from the glomerular tuft',
        description: 'Epithelial capsule collecting primitive glomerular filtrate.',
        acceptableAnswers: ['Bowman capsule', 'Glomerular capsule'],
      },
      {
        id: 'c3',
        number: 3,
        x: 350,
        y: 100,
        label: 'Proximal Convoluted Tubule',
        hint: 'Site of primary reabsorption for glucose, amino acids, and water',
        description: 'Convoluted section reabsorbing 65% of water and virtually all filtered nutrients.',
        acceptableAnswers: ['PCT', 'Proximal tubule'],
      },
      {
        id: 'c4',
        number: 4,
        x: 350,
        y: 310,
        label: 'Descending Loop of Henle',
        hint: 'Water permeable segment penetrating deep into hypertonic medulla',
        description: 'Permeable to water via aquaporins, concentrating tubular filtrate on descent.',
        acceptableAnswers: ['Descending limb', 'Descending loop'],
      },
      {
        id: 'c5',
        number: 5,
        x: 520,
        y: 310,
        label: 'Ascending Loop of Henle',
        hint: 'Water impermeable segment actively pumping Na+ and Cl- into medulla',
        description: 'Impermeable to water; actively transports NaCl into interstitial medulla to drive multiplier.',
        acceptableAnswers: ['Ascending limb', 'Ascending loop', 'Thick ascending limb'],
      },
      {
        id: 'c6',
        number: 6,
        x: 680,
        y: 280,
        label: 'Collecting Duct',
        hint: 'Final channel responsive to ADH where urine concentration is finalized',
        description: 'Final duct regulated by antidiuretic hormone (ADH) transporting urine to renal pelvis.',
        acceptableAnswers: ['Collecting tubule', 'Medullary collecting duct'],
      },
    ],
  },
];
