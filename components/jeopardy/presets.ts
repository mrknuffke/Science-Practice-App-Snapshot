export interface CoursePreset {
    name: string;
    gradeLevel: string;
    standards: string;
    icon: string;
    color: string;
}

export const COURSE_PRESETS: CoursePreset[] = [
    {
        name: "AP Biology",
        gradeLevel: "AP / College",
        standards: "Unit 1: Chemistry of Life, Unit 2: Cell Structure, Unit 3: Cellular Energetics, Unit 4: Cell Communication, Unit 5: Heredity, Unit 6: Gene Expression, Unit 7: Natural Selection, Unit 8: Ecology",
        icon: "🧬",
        color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/60"
    },
    {
        name: "AP Chemistry",
        gradeLevel: "AP / College",
        standards: "Unit 1: Atomic Structure, Unit 2: Molecular/Ionic Compounds, Unit 3: Intermolecular Forces, Unit 4: Chemical Reactions, Unit 5: Kinetics, Unit 6: Thermodynamics, Unit 7: Equilibrium, Unit 8: Acids/Bases, Unit 9: Thermodynamics Applications",
        icon: "⚗️",
        color: "from-violet-500/10 to-purple-500/10 text-violet-700 border-violet-200/60"
    },
    {
        name: "AP Physics 1",
        gradeLevel: "AP / College",
        standards: "Unit 1: Kinematics, Unit 2: Dynamics, Unit 3: Circular Motion & Gravitation, Unit 4: Energy, Unit 5: Momentum, Unit 6: Simple Harmonic Motion, Unit 7: Torque & Rotational Motion",
        icon: "⚛️",
        color: "from-cyan-500/10 to-blue-500/10 text-cyan-700 border-cyan-200/60"
    },
    {
        name: "AP Environmental Science",
        gradeLevel: "AP / College",
        standards: "Unit 1: Ecosystems, Unit 2: Biodiversity, Unit 3: Populations, Unit 4: Earth Systems, Unit 5: Land & Water Use, Unit 6: Energy Resources, Unit 7: Atmospheric Pollution, Unit 8: Aquatic/Terrestrial Pollution, Unit 9: Global Change",
        icon: "🌍",
        color: "from-teal-500/10 to-emerald-500/10 text-teal-700 border-teal-200/60"
    },
    {
        name: "High School Biology",
        gradeLevel: "High School",
        standards: "Cells, Genetics, Evolution, Ecology, Human Body Systems, Biochemistry",
        icon: "🌱",
        color: "from-emerald-400/10 to-green-500/10 text-emerald-800 border-emerald-200/60"
    },
    {
        name: "High School Chemistry",
        gradeLevel: "High School",
        standards: "Matter & Change, Atomic Structure, Periodic Table, Chemical Bonding, Chemical Reactions, Stoichiometry, Gases, Solutions, Acids & Bases",
        icon: "🧪",
        color: "from-violet-400/10 to-purple-500/10 text-violet-800 border-violet-200/60"
    },
    {
        name: "High School Physics",
        gradeLevel: "High School",
        standards: "Mechanics, Energy & Momentum, Waves & Light, Electricity & Magnetism, Thermodynamics",
        icon: "⚡",
        color: "from-cyan-400/10 to-sky-500/10 text-cyan-800 border-cyan-200/60"
    },
    {
        name: "Middle School Life Science",
        gradeLevel: "Middle School",
        standards: "Structure & Function of Cells, Genetics & Heredity, Ecosystem Dynamics, Natural Selection & Adaptation",
        icon: "🎒",
        color: "from-amber-400/10 to-orange-500/10 text-amber-800 border-amber-200/60"
    },
    {
        name: "Middle School Physical Science",
        gradeLevel: "Middle School",
        standards: "Matter & Interactions, Motion & Stability, Forces, Energy, Waves & Electromagnetic Radiation",
        icon: "✏️",
        color: "from-orange-400/10 to-amber-500/10 text-orange-800 border-orange-200/60"
    }
];
