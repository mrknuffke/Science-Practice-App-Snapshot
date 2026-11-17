import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Share2,
  BookOpen,
  Atom,
  CheckCircle2,
  ExternalLink,
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronDown,
  Calculator,
  GraduationCap,
} from 'lucide-react';
import { SIMULATIONS_REGISTRY, SimulationInfo } from '../constants/simulationsRegistry';
import { VIEW_TO_PAGE } from '../constants/publicRoutes';
import { ViewType } from '../types';

interface OpenResourcesViewProps {
  onBack: () => void;
  isAuthenticated: boolean;
  onSelectSimulation?: (view: ViewType) => void;
}

type TabType = 'all' | 'textbooks' | 'pe' | 'xl' | 'simulations';
type UserRole = 'student' | 'teacher';

interface SectionCollapseState {
  textbooks: boolean;
  pe: boolean;
  xl: boolean;
  simulations: boolean;
}

interface TextbookItem {
  id: 'bio' | 'chem' | 'physics';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  lessons: number;
  reviews: number;
  scopeNote?: string;
  tag: string;
  themeColor: 'emerald' | 'violet' | 'cyan';
  icon: string;
}

function formatTextbookBadge(book: TextbookItem): string {
  const lessonPart = `${book.lessons} Lesson${book.lessons === 1 ? '' : 's'}`;
  if (book.reviews > 0) {
    const reviewPart = book.reviews === 1 ? 'Review' : `${book.reviews} Reviews`;
    return `${lessonPart} + ${reviewPart}`;
  }
  if (book.scopeNote) {
    return `${lessonPart} (${book.scopeNote})`;
  }
  return lessonPart;
}

interface PeItem {
  code: string;
  title: string;
  topic: string;
  peParam: string;
}

interface XlItem {
  unit: number;
  title: string;
  description: string;
  url: string;
  itemsCount: number;
  skillsCount: number;
  storyline: string;
}

const STORAGE_ROLE_KEY = 'sp_open_resources_role';
const STORAGE_COLLAPSE_KEY = 'sp_open_resources_collapsed_sections';

const TEXTBOOKS_DATA: TextbookItem[] = [
  {
    id: 'bio',
    title: 'SAS General Biology',
    subtitle: 'Interactive Life Science Textbook',
    description: 'Unit 1 Homeostasis with floating leaf disc data analysis, interactive system models, and checkpoint retrieval practice.',
    url: '/bio/index.html',
    lessons: 13,
    reviews: 3,
    tag: 'Biology',
    themeColor: 'emerald',
    icon: '🌱',
  },
  {
    id: 'chem',
    title: 'SAS General Chemistry',
    subtitle: 'Interactive Physical Chemistry Textbook',
    description: 'Comprehensive 5-unit curriculum with Reference Center drawer, 2D particle dynamics, spaced repetition, and printable summaries.',
    url: '/chem/index.html',
    lessons: 27,
    reviews: 0,
    scopeNote: 'Units 1-5',
    tag: 'Chemistry',
    themeColor: 'violet',
    icon: '📖',
  },
  {
    id: 'physics',
    title: 'SAS General Physics',
    subtitle: 'Interactive Physical Science Textbook',
    description: 'Mechanics and dynamics textbook featuring vector kinematics widgets, motion analysis, and lean zero-build architecture.',
    url: '/physics/index.html',
    lessons: 8,
    reviews: 2,
    tag: 'Physics',
    themeColor: 'cyan',
    icon: '🪐',
  },
];

const PE_MODULES_DATA: PeItem[] = [
  { code: 'HS-PS1-1', title: 'Valence Electrons & Periodic Properties', topic: 'Subatomic structure, periodic trends, and valence patterns', peParam: 'HS-PS1-1' },
  { code: 'HS-PS1-2', title: 'Simple Chemical Reactions & Product Prediction', topic: 'Reactivity patterns, synthesis, decomposition, and single replacement', peParam: 'HS-PS1-2' },
  { code: 'HS-PS1-3', title: 'Bulk Electrical & Thermal Properties', topic: 'Intermolecular forces, particle spacing, and electrical conductivity', peParam: 'HS-PS1-3' },
  { code: 'HS-PS1-4', title: 'Chemical Energy & Bond Energies', topic: 'Endothermic vs exothermic energy changes and bond enthalpies', peParam: 'HS-PS1-4' },
  { code: 'HS-PS1-5', title: 'Collision Theory & Reaction Rates', topic: 'Activation energy, concentration, temperature, and catalysts', peParam: 'HS-PS1-5' },
  { code: 'HS-PS1-6', title: 'Equilibrium & Le Chatelier Principle', topic: 'Dynamic reversible equilibrium and stress response shifts', peParam: 'HS-PS1-6' },
  { code: 'HS-PS1-7', title: 'Conservation of Mass & Stoichiometry', topic: 'Balanced equations, mole ratios, and mass conservation', peParam: 'HS-PS1-7' },
  { code: 'HS-PS1-8', title: 'Nuclear Processes, Fusion & Fission', topic: 'Radioactive decay, alpha/beta emissions, fission, and fusion', peParam: 'HS-PS1-8' },
  { code: 'HS-PS2-6', title: 'Molecular Structure & Material Performance', topic: 'Macroscopic polymer properties from microscopic bonds', peParam: 'HS-PS2-6' },
  { code: 'HS-PS3-1', title: 'Computational Energy Modeling', topic: 'Conservation of mechanical, chemical, and thermal energy systems', peParam: 'HS-PS3-1' },
  { code: 'HS-PS3-4', title: 'Thermal Energy Transfer & Second Law', topic: 'Calorimetry, entropy increase, and closed system energy flow', peParam: 'HS-PS3-4' },
  { code: 'HS-PS4-4', title: 'Electromagnetic Radiation & Matter', topic: 'Photon energy, absorption, emission, and atomic spectra', peParam: 'HS-PS4-4' },
  { code: 'HS-ESS1-1', title: 'Solar Fusion & Core Dynamics', topic: 'Proton-proton chain, radiative balance, and hydrogen burning', peParam: 'HS-ESS1-1' },
  { code: 'HS-ESS1-2', title: 'Big Bang & Cosmic Abundance', topic: 'Cosmic microwave background and cosmological light elements', peParam: 'HS-ESS1-2' },
  { code: 'HS-ESS1-3', title: 'Stellar Nucleosynthesis & Supernovae', topic: 'Main-sequence fusion cycles and heavy element synthesis', peParam: 'HS-ESS1-3' },
];

const XL_PRACTICE_DATA: XlItem[] = [
  {
    unit: 1,
    title: 'Atomic Structure & Electron Configurations',
    description: 'Subatomic particles, isotopic abundance, Coulombic attraction, Bohr transitions, and electron configurations.',
    url: '/chem/xl/practice/unit1.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Astrophysical spectroscopy & stellar chemistry',
  },
  {
    unit: 2,
    title: 'Periodic Trends, Bonding & Molecular Geometry',
    description: 'Periodic trend reasoning, lattice energy, electronegativity, Lewis dot structures, and VSEPR geometries.',
    url: '/chem/xl/practice/unit2.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Advanced materials & semiconductor engineering',
  },
  {
    unit: 3,
    title: 'Intermolecular Forces & States of Matter',
    description: 'Dipole moments, London dispersion, hydrogen bonding, heating curves, and phase transition thermodynamics.',
    url: '/chem/xl/practice/unit3.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Atmospheric science & cryogenic refrigerants',
  },
  {
    unit: 4,
    title: 'Reactions & Stoichiometry',
    description: 'Equation balancing, reaction classification, mole-to-mass conversions, limiting reactants, and percent yield.',
    url: '/chem/xl/practice/unit4.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Culinary stoichiometry & recipe scaling',
  },
  {
    unit: 5,
    title: 'Kinetics & Thermochemistry',
    description: 'Specific heat, calorimetry, heating curves, bond energies, Hess\'s law, enthalpy of formation, and reaction kinetics.',
    url: '/chem/xl/practice/unit5.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Energy of food preparation & culinary thermodynamics',
  },
  {
    unit: 6,
    title: 'Solutions & Chemical Equilibrium',
    description: 'Molarity, dilutions, dynamic equilibrium expressions, Keq calculations, ICE tables, and Le Chatelier shifts.',
    url: '/chem/xl/practice/unit6.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Marine carbonate equilibria & shellfish die-off',
  },
  {
    unit: 7,
    title: 'Acids, Bases & Aqueous Systems',
    description: 'Bronsted-Lowry acid-base models, pH/pOH calculations, weak acid Ka equilibria, titrations, and buffer systems.',
    url: '/chem/xl/practice/unit7.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Ocean acidification & coastal marine ecology',
  },
  {
    unit: 8,
    title: 'Gases & Pressure',
    description: 'Kinetic Molecular Theory, gas laws (Boyle, Charles, Combined, Ideal), gas stoichiometry, Dalton\'s partial pressures, and real gas deviations.',
    url: '/chem/xl/practice/unit8.html',
    itemsCount: 16,
    skillsCount: 8,
    storyline: 'Atmospheric gas dynamics & hyperbaric physiology',
  },
];

export const OpenResourcesView: React.FC<OpenResourcesViewProps> = ({
  onBack,
  isAuthenticated,
  onSelectSimulation,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // User Role Preference (Student vs Teacher) with memory and app sync
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ROLE_KEY);
      if (saved === 'teacher' || saved === 'student') return saved;
      if (localStorage.getItem('sp_teacher_mode') === 'true') return 'teacher';
    } catch {
      // Ignore storage errors
    }
    return 'student';
  });

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    try {
      localStorage.setItem(STORAGE_ROLE_KEY, newRole);
      localStorage.setItem('sp_teacher_mode', newRole === 'teacher' ? 'true' : 'false');
    } catch {
      // Ignore storage errors
    }
  };

  // Section Collapse State with memory
  const [collapsedSections, setCollapsedSections] = useState<SectionCollapseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COLLAPSE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
    return { textbooks: false, pe: false, xl: false, simulations: false };
  });

  const toggleSection = (section: keyof SectionCollapseState) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [section]: !prev[section] };
      try {
        localStorage.setItem(STORAGE_COLLAPSE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const setAllSections = (collapsed: boolean) => {
    const next: SectionCollapseState = {
      textbooks: collapsed,
      pe: collapsed,
      xl: collapsed,
      simulations: collapsed,
    };
    setCollapsedSections(next);
    try {
      localStorage.setItem(STORAGE_COLLAPSE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage errors
    }
  };

  const handleCopyLink = (url: string, label: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(label);
      setTimeout(() => setCopiedUrl(null), 2200);
    });
  };

  const handleShareHub = () => {
    handleCopyLink('/?page=resources', 'hub');
  };

  // Filtered queries
  const query = searchQuery.trim().toLowerCase();

  const filteredTextbooks = useMemo(() => {
    if (!query) return TEXTBOOKS_DATA;
    return TEXTBOOKS_DATA.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.subtitle.toLowerCase().includes(query) ||
        b.description.toLowerCase().includes(query) ||
        b.tag.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredPeModules = useMemo(() => {
    if (!query) return PE_MODULES_DATA;
    return PE_MODULES_DATA.filter(
      (pe) =>
        pe.code.toLowerCase().includes(query) ||
        pe.title.toLowerCase().includes(query) ||
        pe.topic.toLowerCase().includes(query)
    );
  }, [query]);

  const filteredXlSuites = useMemo(() => {
    if (!query) return XL_PRACTICE_DATA;
    return XL_PRACTICE_DATA.filter(
      (xl) =>
        xl.title.toLowerCase().includes(query) ||
        xl.description.toLowerCase().includes(query) ||
        xl.storyline.toLowerCase().includes(query) ||
        `unit ${xl.unit}`.includes(query)
    );
  }, [query]);

  const filteredSimulations = useMemo(() => {
    if (!query) return SIMULATIONS_REGISTRY;
    return SIMULATIONS_REGISTRY.filter(
      (sim) =>
        sim.title.toLowerCase().includes(query) ||
        sim.blurb.toLowerCase().includes(query) ||
        sim.topics.some((t) => t.toLowerCase().includes(query))
    );
  }, [query]);

  const totalItemCount =
    TEXTBOOKS_DATA.length +
    PE_MODULES_DATA.length +
    XL_PRACTICE_DATA.length +
    SIMULATIONS_REGISTRY.length;

  // Determine section visibility and expansion
  const isTextbooksExpanded = query.length > 0 ? filteredTextbooks.length > 0 : !collapsedSections.textbooks;
  const isPeExpanded = query.length > 0 ? filteredPeModules.length > 0 : !collapsedSections.pe;
  const isXlExpanded = query.length > 0 ? filteredXlSuites.length > 0 : !collapsedSections.xl;
  const isSimulationsExpanded = query.length > 0 ? filteredSimulations.length > 0 : !collapsedSections.simulations;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left max-w-7xl mx-auto px-2 sm:px-4 pb-16">
      
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors font-rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Sign In'}
        </button>

        {/* Role Selector & Share Button */}
        <div className="flex items-center gap-3">
          {/* Student vs Teacher Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 font-rounded ${
                userRole === 'student'
                  ? 'bg-white dark:bg-[#1E212A] text-indigo-600 dark:text-[#818CF8] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🎒</span>
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 font-rounded ${
                userRole === 'teacher'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>🍎</span>
              <span>Teacher</span>
            </button>
          </div>

          <button
            onClick={handleShareHub}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors font-rounded"
          >
            {copiedUrl === 'hub' ? (
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Copied Hub URL!
              </span>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" /> Share Open Hub
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 bg-white dark:bg-[#1A1D26] rounded-[2rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Open Science Studio
            </div>
            {userRole === 'teacher' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 uppercase tracking-wider border border-amber-500/30">
                <GraduationCap className="w-3 h-3" />
                Instructor Mode Active
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] tracking-tight font-rounded">
            Open Access Science Resources
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
            Curriculum-aligned interactive textbooks, NGSS chemistry performance expectation modules, deterministic practice suites, and real-time particle simulations. 100% client-side, zero sign-in required, free forever.
          </p>

          {/* Teacher Specific Quick Action Bar */}
          {userRole === 'teacher' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300">
              <div className="space-y-0.5">
                <div className="text-xs font-black text-amber-900 dark:text-amber-300 font-rounded">
                  Instructor Verification &amp; Retake Controls
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-400">
                  Authenticate student digital receipts or generate randomized retake practice decks.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/chem/xl/practice/verify.html?from=resources"
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-rounded transition-colors flex items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> XL Verifier
                </a>
                <a
                  href="/chem/pe/verify.html?from=resources"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold text-xs font-rounded transition-colors flex items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> PE Verifier
                </a>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <BookOpen className="w-3 h-3 text-emerald-500" /> {TEXTBOOKS_DATA.length} Textbooks
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Award className="w-3 h-3 text-amber-500" /> {PE_MODULES_DATA.length} NGSS PE Modules
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Calculator className="w-3 h-3 text-indigo-500" /> {XL_PRACTICE_DATA.length} XL Practice Suites
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              <Atom className="w-3 h-3 text-cyan-500" /> {SIMULATIONS_REGISTRY.length} Simulations
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#1E212A] text-indigo-600 dark:text-[#818CF8] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({totalItemCount})
            </button>
            <button
              onClick={() => setActiveTab('textbooks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'textbooks'
                  ? 'bg-white dark:bg-[#1E212A] text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Textbooks ({TEXTBOOKS_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('pe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'pe'
                  ? 'bg-white dark:bg-[#1E212A] text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              NGSS PE Practice ({PE_MODULES_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('xl')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'xl'
                  ? 'bg-white dark:bg-[#1E212A] text-indigo-600 dark:text-[#818CF8] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              XL Practice Sets ({XL_PRACTICE_DATA.length})
            </button>
            <button
              onClick={() => setActiveTab('simulations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'simulations'
                  ? 'bg-white dark:bg-[#1E212A] text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Simulations ({SIMULATIONS_REGISTRY.length})
            </button>
          </div>

          {/* Search Input and Expand/Collapse All Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input aria-label="Search resources"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, codes, or titles..."
                className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E212A] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="hidden sm:flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-xl p-1 bg-white dark:bg-[#1E212A]">
              <button
                type="button"
                onClick={() => setAllSections(false)}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                title="Expand all segments"
              >
                Expand All
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={() => setAllSections(true)}
                className="px-2 py-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                title="Collapse all segments"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 1: INTERACTIVE TEXTBOOKS */}
      {(activeTab === 'all' || activeTab === 'textbooks') && filteredTextbooks.length > 0 && (
        <section className="space-y-4">
          {/* Expandable Accordion Header */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('textbooks')}
            className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E212A] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all cursor-pointer shadow-sm select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-rounded flex items-center gap-2">
                  Interactive Open Textbooks
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {filteredTextbooks.length} Available
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Zero-build static textbook sites with interactive checkpoints, formulas, and spaced repetition.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline font-rounded">
                {isTextbooksExpanded ? 'Collapse' : 'Expand'}
              </span>
              <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isTextbooksExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Expandable Grid */}
          {isTextbooksExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
              {filteredTextbooks.map((book) => {
                const borderClass =
                  book.themeColor === 'emerald'
                    ? 'border-emerald-500/30 hover:border-emerald-500/60'
                    : book.themeColor === 'violet'
                    ? 'border-indigo-500/30 hover:border-indigo-500/60'
                    : 'border-cyan-500/30 hover:border-cyan-500/60';

                const badgeColor =
                  book.themeColor === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : book.themeColor === 'violet'
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400';

                const originUrl = `${book.url}?from=resources`;

                return (
                  <div
                    key={book.id}
                    className={`bento-card border ${borderClass} bg-white dark:bg-[#1E212A] p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-all`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{book.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColor}`}>
                          {formatTextbookBadge(book)}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-rounded">
                          {book.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {book.subtitle}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <a
                        href={originUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-all font-rounded"
                      >
                        Open Book <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(originUrl, book.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold"
                        title="Copy Direct Link"
                      >
                        {copiedUrl === book.id ? (
                          <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* PILLAR 2: NGSS CHEMISTRY PE ADAPTIVE PRACTICE */}
      {(activeTab === 'all' || activeTab === 'pe') && filteredPeModules.length > 0 && (
        <section className="space-y-4">
          {/* Expandable Accordion Header */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('pe')}
            className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E212A] border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer shadow-sm select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-rounded flex items-center gap-2">
                  NGSS Chemistry PE Adaptive Practice
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {filteredPeModules.length} Modules
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {PE_MODULES_DATA.length} Performance Expectation modules with 3-tier leveling, automated remediation, and cryptographic receipts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href="/chem/pe/index.html?from=resources"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 transition-all font-rounded"
                >
                  PE Hub <ChevronRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/chem/pe/verify.html?from=resources"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-rounded"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Verifier
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline font-rounded">
                  {isPeExpanded ? 'Collapse' : 'Expand'}
                </span>
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isPeExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Grid */}
          {isPeExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
              {filteredPeModules.map((pe) => {
                const directUrl = `/chem/pe/index.html?pe=${pe.peParam}&from=resources`;
                return (
                  <div
                    key={pe.code}
                    className="bento-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E212A] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:border-amber-400/60 dark:hover:border-amber-500/50 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 font-mono tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md">
                          {pe.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          3 Levels
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {pe.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pe.topic}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <a
                        href={directUrl}
                        className="text-xs font-bold text-indigo-600 dark:text-[#818CF8] hover:underline flex items-center gap-1 font-rounded"
                      >
                        Start Practice <ChevronRight className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(directUrl, pe.code)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy Direct URL"
                      >
                        {copiedUrl === pe.code ? (
                          <span className="text-emerald-500 text-[10px] font-bold">Copied!</span>
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* PILLAR 3: ACCELERATED CHEMISTRY (XL) PRACTICE SUITES */}
      {(activeTab === 'all' || activeTab === 'xl') && filteredXlSuites.length > 0 && (
        <section className="space-y-4">
          {/* Expandable Accordion Header */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('xl')}
            className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E212A] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-[#818CF8] shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-rounded flex items-center gap-2">
                  Accelerated Chemistry Practice Suites
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8]">
                    {filteredXlSuites.length} Workstations
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Deterministic 16-item workstations with 5 calculation attempts, seeded PRNG, and certified SHA-256 receipts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <a
                  href="/chem/xl/practice/index.html?from=resources"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all font-rounded"
                >
                  XL Hub <ChevronRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href="/chem/xl/practice/verify.html?from=resources"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-rounded"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Verifier
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline font-rounded">
                  {isXlExpanded ? 'Collapse' : 'Expand'}
                </span>
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isXlExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Grid */}
          {isXlExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
              {filteredXlSuites.map((xl) => {
                const workstationUrl = `${xl.url}?from=resources`;
                return (
                  <div
                    key={xl.unit}
                    className="bento-card border border-indigo-500/30 hover:border-indigo-500/60 bg-white dark:bg-[#1E212A] p-6 rounded-2xl shadow-sm flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8]">
                          Unit {xl.unit} Workstation
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {xl.itemsCount} Items ({xl.skillsCount} Skills)
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white font-rounded">
                          {xl.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Storyline: {xl.storyline}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                        {xl.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <a
                        href={workstationUrl}
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all font-rounded shadow-sm"
                      >
                        Start Workstation <ChevronRight className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleCopyLink(workstationUrl, `xl-${xl.unit}`)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold"
                        title="Copy Workstation URL"
                      >
                        {copiedUrl === `xl-${xl.unit}` ? (
                          <span className="text-emerald-500 flex items-center gap-1 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                          </span>
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* PILLAR 4: INTERACTIVE SIMULATIONS */}
      {(activeTab === 'all' || activeTab === 'simulations') && filteredSimulations.length > 0 && (
        <section className="space-y-4">
          {/* Expandable Accordion Header */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => toggleSection('simulations')}
            className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1E212A] border border-slate-200/80 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm select-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-rounded flex items-center gap-2">
                  Interactive Simulations
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                    {filteredSimulations.length} Simulators
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {SIMULATIONS_REGISTRY.length} vector and canvas simulators covering biology, chemistry, and physics without sign-in requirements.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 hidden sm:inline font-rounded">
                {isSimulationsExpanded ? 'Collapse' : 'Expand'}
              </span>
              <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${isSimulationsExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Expandable Grid */}
          {isSimulationsExpanded && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
              {filteredSimulations.map((sim: SimulationInfo) => {
                const pageParam = VIEW_TO_PAGE[sim.view] || sim.id;
                const directUrl = `/?page=${pageParam}`;

                return (
                  <div
                    key={sim.id}
                    className="bento-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E212A] p-4 rounded-2xl shadow-sm flex flex-col justify-between hover:border-cyan-400/60 dark:hover:border-cyan-500/50 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{sim.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Interactive
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {sim.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                        {sim.blurb}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (onSelectSimulation) {
                            onSelectSimulation(sim.view);
                          } else {
                            window.location.href = directUrl;
                          }
                        }}
                        className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-rounded"
                      >
                        Run Sim <ChevronRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleCopyLink(directUrl, sim.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        title="Copy Direct URL"
                      >
                        {copiedUrl === sim.id ? (
                          <span className="text-emerald-500 text-[10px] font-bold">Copied!</span>
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Authenticated AI Practice Callout */}
      <div className="bento-card border border-indigo-150 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-indigo-950/20 dark:via-[#1A1D26] dark:to-violet-950/20 p-6 sm:p-8 rounded-[2rem] text-center space-y-3">
        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-rounded">
          Looking for Adaptive AI Practice Tools?
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Students with an approved school Google account can sign in to unlock personalized quizzes, flashcard mastery loops, Socratic dialogue, lab simulators, and trophy achievements.
        </p>
        <div className="pt-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all font-rounded shadow-md hover:shadow-lg"
          >
            {isAuthenticated ? 'Go to Internal Dashboard' : 'Sign In with Google Account'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenResourcesView;
