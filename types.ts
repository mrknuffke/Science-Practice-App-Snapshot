


export type CourseType =
  // Custom
  | 'Custom Practice'
  // Biology
  | 'AP Biology' | 'Honors Biology' | 'General Biology'
  // Electives / Integrated
  | 'Anatomy and Physiology' | 'Marine Biology' | 'Biotechnology' | 'Forensic Science' | 'Physical Science'
  // Chemistry
  | 'AP Chemistry' | 'Honors Chemistry' | 'General Chemistry'
  // Physics
  | 'AP Physics C' | 'AP Physics 2' | 'AP Physics 1' | 'Honors Physics' | 'General Physics'
  | 'AP Environmental Science' | 'Environmental Science'
  // Earth & Space
  | 'Honors Earth and Space Science' | 'General Earth and Space Science'
  // Middle School
  | 'Middle School Life Science' | 'Middle School Physical Science' | 'Middle School Earth and Space Science'
  // Elementary School
  | 'Elementary School Life Science' | 'Elementary School Physical Science' | 'Elementary School Earth and Space Science'
  // International Baccalaureate (IB)
  | 'IB Biology SL' | 'IB Biology HL'
  | 'IB Chemistry SL' | 'IB Chemistry HL'
  | 'IB Physics SL' | 'IB Physics HL'
  | 'IB Environmental Systems and Societies SL' | 'IB Environmental Systems and Societies HL';

export type SubjectType = 'Biology' | 'Chemistry' | 'Physics' | 'Environmental' | 'Middle School' | 'Elementary School' | 'Elective' | 'Custom';

export type WorksheetFocus = 'Standard Mixed' | 'Data Analysis' | 'CER Practice' | 'Math & Problem Solving';

export interface GraphConfig {
  type: 'line' | 'bar' | 'scatter';
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: Array<Record<string, number | string>>;
  series: Array<{
    key: string;
    name: string;
    color?: string;
  }>;
}

export interface DataExhibit {
  title: string;
  type: 'table' | 'graph' | 'text';
  content: string; // HTML table string or text paragraph (fallback)
  chartData?: GraphConfig; // Structured data for Recharts
  caption?: string; // Explanation/Legend
}

export interface Question {
  id: string;
  text: string;
  unit: string; // Refers to "Main Idea" in UI
  topic: string;
  type: 'mcq' | 'sa' | 'error_correction' | 'frq' | 'cer' | 'fill_in_blank';
  subType?: string; // e.g. "Analogy", "Odd One Out", "Recall"
  options?: string[]; // Only for MCQ
  correctAnswer?: string; // Correct answer text for Answer Keys
  rubric?: string[]; // For FRQ grading context
  scenario?: string; // For FRQ/CER context/intro
  exhibits?: DataExhibit[]; // For CER multi-modal data
  subQuestions?: string[]; // For FRQ parts (a, b, c...)
  sectionTitle?: string; // For test creator - grouping questions by section (e.g., "Part 1: Multiple Choice")
}

export type FlashcardType = 'basic' | 'cloze' | 'true_false' | 'mcq' | 'image_occlusion' | 'multi_step';

export interface MultiStepItem {
  stepNumber: number;
  title: string;
  description: string;
}

export interface OcclusionMask {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  isTarget?: boolean;
}

export interface Flashcard {
  id: string;
  type?: FlashcardType;
  term: string;
  definition: string;
  options?: string[];
  context?: string;
  occlusionSvg?: string;
  occlusionViewBox?: string;
  occlusionMasks?: OcclusionMask[];
  multiStepSteps?: MultiStepItem[];
}

export interface FlashcardReport {
  score: string; // e.g., "12/15"
  masteredTerms: string[];
  missedTerms: string[];
  summary: string;
  strategies: string[];
}

export interface RubricData {
  successCriteria: string[];
  studentFriendly: string;
}

export interface CertaintyScore {
  level: number; // 1-5 self-assessed scale
  factors: string[]; // reasons for rating
}

export interface AIExplanation {
  deepDive: string;
  keyConcepts: string[];
  commonMisconceptions: string;
  visualMapping?: string | null;
  certainty?: CertaintyScore; // Accuracy/Certainty self-assessment
}

export interface Badge {
  name: string;
  description: string;
  emoji: string;
  rarity: string;
  color: string;
}

export interface SavedBadge extends Badge {
  id: string;
  dateEarned: string;
  topic: string;
  course: string;
  score?: string; // e.g. "8/10" or "80%"
  version?: string; // e.g. "2.0" for new point system
}

export interface RubricCriterionEvaluation {
  criterion: string; // e.g. "Claim / Direct Answer", "Evidence Citation", "Scientific Reasoning", or "Part A: Identify"
  status: 'met' | 'partially_met' | 'missing';
  pointsAwarded?: number;
  pointsPossible?: number;
  studentExclusionOrMatch?: string; // What the student wrote or what was missing
  modelEvidence?: string; // What the exemplar demonstrated
  suggestedRevision?: string; // Concrete 1-sentence rewrite tip
}

export interface DetailedFeedback {
  question: string;
  studentAnswer: string;
  evaluation: 'Correct' | 'Incorrect' | 'Partially Correct';
  feedback: string;
  textbookReference?: string;
  searchQueries?: string[]; // Replacing direct hallucinated URLs with search strings
  // New Tutor Insight Fields
  tutorDeepDive: string;
  keyConcept: string;
  misconceptionAlert: string;
  rubricScore?: string; // Specific for FRQ (e.g., "+3/4 points")
  visualMapping?: string | null;
  optionAnalysis?: { option: string; explanation: string; isCorrect?: boolean }[]; // New breakdown for MCQ
  rubricBreakdown?: RubricCriterionEvaluation[]; // Breakdown for FRQ and CER
  modelAnswer?: string; // Gold-standard exemplar answer
}

export interface GradingReport {
  score: string;
  summary: string;
  detailedFeedback: DetailedFeedback[];
  studyRecommendations: string[];
  badge: Badge;
  certainty?: CertaintyScore; // Accuracy/Certainty self-assessment
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isDivider?: boolean; // Visual break for mode switches
}

export type LabTrack = 'design' | 'analysis' | 'feedback' | 'errors' | 'mentor' | 'safety';

export interface LabState {
  projectContext: string;
  dataTable: { x: string; y: string }[];
  dataHeaders: { xLabel: string; xUnit: string; yLabel: string; yUnit: string };
}

export interface ResearchState {
  question: string;
  hypothesis: string;
  methodology: string;
  dataStatus: string;
  literatureNotes: string;
  chatHistory: ChatMessage[];
  lastUpdated: number;
}

export interface TopicOverview {
  summary: string;
  keyPoints: string[];
  resources: { title: string; query: string; type: 'video' | 'article' }[];
  uploadedContext?: string; // Text extracted from uploads
  suggestedActivities?: string[];
}

export interface MultiModeState {
  isActive: boolean;
  topic: string;
  course: CourseType;
  overview: TopicOverview | null;
  activityLog: {
    type: string; // 'quiz', 'flashcards', etc.
    timestamp: number;
    score?: string; // "8/10"
    details?: string; // "Quiz on Photosynthesis"
  }[];
  partnerState?: {
    explanationChat: ChatMessage[];
    calculationChat: ChatMessage[];
  };
}

export interface TaskResponse {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer?: string;
  feedback?: string;
  evaluation?: 'Correct' | 'Incorrect' | 'Partially Correct';
}

export interface StudySprintTask {
  id: string;
  type: 'quiz' | 'frq' | 'cer' | 'worksheet' | 'calculation' | 'flashcards';
  title: string;
  description: string;
  focus?: string; // Optional user-edited focus topic for this specific task
  status: 'pending' | 'in_progress' | 'completed';
  order: number; // 1, 2, 3, 4, 5

  // Captured after completion
  responses?: TaskResponse[];
  score?: string;
  timestamp?: number;
  duration?: number;
}

export interface StudySprintState {
  isActive: boolean;
  course: CourseType;
  gradeLevel: string;
  units: string;
  topics: string;
  subtopicFocus?: string;
  tasks: StudySprintTask[];
  sessionStartTime: number;
  sessionEndTime?: number;
  bonusPractice?: {
    questions: Question[];
    answerKey: string[];
  };
}

export interface StudySprintReportData {
  summary: string;
  taskAnalysis: {
    taskId: string;
    strengths: string[];
    improvements: string[];
  }[];
  recommendations: string[];
}

export interface TestConfig {
  course: string; // Free-form text for flexible curriculum (not restricted to CourseType)
  unitTitle: string;
  drivingQuestion: string;
  powerStandards: string;
  selectedStructure: 'Three-Section' | 'Custom';

  // Custom Counts
  mcqCount: number;
  saCount: number;
  calculationCount: number; // For Chem/Physics
  graphingCount: number; // For Data Analysis

  // Output Options
  includeRubric: boolean;
  includeAnswerKey: boolean;
  studentHeader: boolean;

  // Advanced
  durationMinutes: number;
  rigorProfile: 'Standard' | 'Honors' | 'AP/College';
}

export interface TestSection {
  title: string;
  instructions: string;
  questions: Question[];
}

export interface AppConfig {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  // questionCount removed as it is legacy
  timerDuration?: number; // In seconds
  questionStyle?: 'Standard' | 'Data Analysis' | 'Visuals' | 'Experimental Design' | 'Scenario Analysis' | string; // Allow string for flexibility or specific union
  worksheetFocus?: WorksheetFocus[];
  worksheetStyle?: 'Leveled' | 'Mixed';
  mcqCount: number;
  saCount: number;
  errorCount: number;
  analogyCount?: number;
  oddOneOutCount?: number;
  persona?: 'Tutor' | 'Socratic' | 'Skeptic' | 'Growth Coach';
  flashcardStyle?: 'Standard' | 'Scenario' | 'Concept Map';
  fillInBlankCount?: number;
  // Topic Dashboard panel preferences
  showExplanationPanel?: boolean; // Show Explanation Partner in Topic Dashboard (default true)
  showCalculationPanel?: boolean; // Show Calculation Partner in Topic Dashboard (default true)

  // New Calculation Mode Option
  sequencingStyle?: 'Massed' | 'Interleaved' | 'Increasing';
}

export interface WhoAmIPuzzle {
  id: string;
  entity: string; // The answer (e.g., "Mitochondria", "Marie Curie")
  clues: string[]; // List of 5 progressive clues, hardest to easiest
  factoid?: string; // An interesting fact to show after reveal
}

// Session History Types
export interface SessionSnapshot {
  id: string;
  timestamp: number;
  dateCompleted: string;  // ISO string

  mode: ModeType;
  course: CourseType;
  topics: string[];  // Multi-topic support
  unit: string | null;

  questions: Question[];
  answers: Record<number, string>;
  report: GradingReport;
  config: AppConfig;

  score: string;
  duration?: number;  // ms
  badgeId?: string;  // Link to Trophy Room badge
}

export interface SessionHistoryMetadata {
  totalSessions: number;
  oldestSessionDate: string;
  sizeEstimateKB: number;
}

export interface BingoTerm {
  id: string;
  term: string;
  clues: string[];
}

export interface BingoBoard {
  id: string;
  grid: (string | null)[][]; // 5x5 array of strings (terms) or null (Free Space)
}

export interface BingoPreset {
  id: string;
  name: string;
  terms: Omit<BingoTerm, 'id'>[]; // Presets don't need IDs internally until generated
}

export type BingoPresetOptionType = 'select' | 'multiselect';

export interface BingoPresetOption {
  id: string; // e.g., "element_range"
  label: string; // e.g., "Elements Included"
  type: BingoPresetOptionType;
  choices: string[]; // e.g., ["Elements 1-20", "Elements 1-118", "s-block", "p-block"...]
  defaultValues: string[]; // For select, array of size 1. For multiselect, array of N strings.
}

export interface BingoSmartPreset {
  id: string;
  name: string;
  basePromptModifier: string; // General instructions for this preset
  options: BingoPresetOption[];
}

export type ViewType =
  | 'landing'
  | 'subject_library'
  | 'practice_center'
  | 'browse'
  | 'level_selection'
  | 'menu'
  | 'quiz'
  | 'explanation'
  | 'analyzing'
  | 'results'
  | 'how_it_works'
  | 'features'
  | 'support'
  | 'supporters'
  | 'changelog'
  | 'feedback'
  | 'trophy_room'
  | 'flashcards'
  | 'worksheet'
  | 'frq'
  | 'cer'
  | 'calculation'
  | 'quiz_my_notes_setup'
  | 'note_sheet'
  | 'lab'
  | 'rubric_translator'
  | 'interview'
  | 'document_creator'
  | 'document_config'
  | 'test_creator_setup'
  | 'research'
  | 'multimode'
  | 'multimode_report'
  | 'review_games'
  | 'jeopardy'
  | 'jeopardy_setup'
  | 'square_match'
  | 'square_match_setup'
  | 'bingo_setup'
  | 'charades_setup'
  | 'taboo_setup'
  | 'who_am_i_setup'
  | 'who_am_i_preview'
  | 'who_am_i_game'
  | 'teachers'
  | 'support'
  | 'reflection'
  | 'study_sprint_setup'
  | 'study_sprint_dashboard'
  | 'study_sprint_report'
  | 'session_history'
  | 'session_detail'
  | 'simulations_hub'
  | 'covalent_bonding'
  | 'ionic_bonding'
  | 'periodic_table'
  | 'build_an_atom'
  | 'ecosystem_simulation'
  | 'population_genetics'
  | 'phase_change'
  | 'regulatory_modeler'
  | 'diffusion_simulation'
  | 'reaction_kinetics_simulation'
  | 'gas_laws'
  | 'free_body_diagram'
  | 'ap_bio_review'
  | 'ap_chem_review'
  | 'ap_enviro_review'
  | 'ap_physics1_review'
  | 'ap_physics2_review'
  | 'ap_physicsc_review'
  | 'settings'
  | 'ap_review_catalog'
  | 'ap_review_tutor'
  | 'learning_loop'
  | 'motion_tracker'
  | 'calorimetry'
  | 'blood_buffer'
  | 'nuclear_decay'
  | 'osmosis_lab'
  | 'carbon_journey'
  | 'island_biogeography'
  | 'concept_map'
  | 'diagram_labeling'
  | 'skeptic'
  | 'tutor'
  | 'socratic'
  | 'growth_coach'
  | 'vocab_relay'
  | 'open_resources';

export type ModeType =
  | 'quiz'
  | 'explanation'
  | 'flashcards'
  | 'worksheet'
  | 'frq'
  | 'cer'
  | 'calculation'
  | 'quiz_my_notes'
  | 'concept_map'
  | 'diagram_labeling'
  | 'skeptic'
  | 'tutor'
  | 'socratic'
  | 'growth_coach'
  | 'lab'
  | 'interview'
  | 'exit_ticket'
  | 'test_creator'
  | 'research'
  | 'multimode'
  | 'review_games'
  | 'jeopardy'
  | 'square_match'
  | 'bingo'
  | 'study_sprint'
  | 'who_am_i'
  | 'vocab_relay'
  | 'simulation'
  | 'regulatory_modeler'
  | 'diffusion_simulation'
  | 'reaction_kinetics_simulation'
  | 'ap_bio_review'
  | 'ap_chem_review'
  | 'ap_enviro_review'
  | 'ap_physics1_review'
  | 'ap_physics2_review'
  | 'ap_physicsc_review';

export interface AppState {
  view: ViewType;
  mode: ModeType;

  selectedLevel: 'Elementary School' | 'Middle School' | 'High School' | null;
  selectedCourse: CourseType | null;
  selectedUnit: string | null; // Represents "Main Idea" selection
  selectedTopic: string | null; // Single-topic selection (used alongside selectedTopics for compatibility)
  selectedTopics: string[]; // NEW: Primary field for multi-topic support
  questions: Question[];
  flashcards: Flashcard[];
  whoAmIPuzzles?: WhoAmIPuzzle[];
  answers: Record<number, string>;
  chatHistory: ChatMessage[];
  report: GradingReport | null;
  multiModeState: MultiModeState | null; // New Multi-Mode State Persistence
  studySprintState: StudySprintState | null; // Study Sprint State Persistence
  currentSprintTaskId: string | null; // Track which Study Sprint task is currently being worked on
  analyzedImage?: string; // Base64 string for the uploaded image in "Analyze This" mode
  accessibilityMode: boolean; // New State for Dyslexia Friendly font
  selectedLabTrack: LabTrack; // New state for Lab Co-Pilot track
  labState: LabState; // Sticky state for Lab Co-Pilot keys
  teacherMode: boolean; // Toggles advanced copy features and answer keys
  useVisuals: boolean; // Global preference for visual explanations
  config: AppConfig;
  testConfig?: TestConfig; // Specific config for Test Creator Mode
}

// ============================================================
// SIMULATION TYPES (Covalent Bonding & Future Simulations)
// ============================================================

export interface Atom {
  id: string;
  element: string; // 'H', 'C', 'N', 'O', 'F', 'Cl', 'S', 'P', etc.
  position: { x: number; y: number };
  valenceElectrons: number; // Total valence electrons (e.g., C=4, O=6, H=1)
  electronAssignments: {
    bonding: number; // Electrons used in bonds
    lonePairs: number; // Electrons in lone pairs
    available: number; // Unassigned electrons
  };
  bonds: string[]; // IDs of connected bonds
}

export interface Bond {
  id: string;
  atom1Id: string;
  atom2Id: string;
  type: 'single' | 'double' | 'triple';
  electrons: number; // 2, 4, or 6
}

export interface Molecule {
  id: string;
  atoms: Atom[];
  bonds: Bond[];
  formula: string; // e.g., "H2O"
  name?: string; // Common name if recognized
  geometry?: string; // 'linear', 'bent', 'tetrahedral', etc.
  polarity?: 'polar' | 'nonpolar';
  bondAngles?: number[];
  formalCharge?: number;
  molarMass?: number;
}

export interface VisualizationMode {
  type: 'dot-cross' | 'structural' | '3d-model';
  showLabels: boolean;
  showLonePairs: boolean;
  showBondAngles: boolean;
}

export interface MoleculeValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  completeness: number; // Percentage of atoms with satisfied octets
}

export interface AtomStatus {
  atomId: string;
  element: string;
  octetSatisfied: boolean;
  assignedElectrons: number;
  targetElectrons: number; // 2 for H, 8 for most others
}

// ============================================================
// REGULATORY MODELER TYPES
// ============================================================

// Legacy type kept for backward compat — new code uses NodeTypeDefinition
export type RegulatoryNodeType = 'signal' | 'gene' | 'protein' | 'environment'
  | 'hormone' | 'receptor' | 'organism' | 'molecule' | 'population' | 'custom';

export interface NodeTypeDefinition {
  id: string;         // matches RegulatoryNodeType or a user-defined string
  label: string;      // display name
  color: string;      // hex or tailwind color
  description?: string;
}

export interface RegulatoryNode {
  id: string;
  type: RegulatoryNodeType;
  label: string;
  position: { x: number; y: number };
  activationLevel: number; // 0 to 100
  isManualToggle?: boolean;
  customDecayRate?: number;    // override global decay
  customActivationRate?: number;
}

export type ConnectionType = 'activation' | 'repression';

export interface RegulatoryConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: ConnectionType;
  strength: number; // Multiplier, default 1.0
}

export interface ModelerSavedState {
  nodes: RegulatoryNode[];
  connections: RegulatoryConnection[];
  nodeTypeDefinitions: NodeTypeDefinition[];
}

// ============================================================
// DIFFUSION SIMULATION TYPES
// ============================================================

export type ParticleType = 'oxygen' | 'glucose' | 'sodium';
export type TransportMechanism = 'simple' | 'channel' | 'pump';

export interface DiffusionParticle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isTransporting?: boolean; // True if it is currently inside a protein
}

export type PumpPhase = 'idle' | 'binding' | 'pumping' | 'releasing';

export interface MembraneProtein {
  id: string;
  type: 'channel' | 'pump';
  allowedParticle: ParticleType;
  x: number;               // Horizontal position along the membrane
  isTransporting: boolean; // Is it currently moving a particle?
  hasATP?: boolean;        // For pumps only
  pumpDirection?: 'in' | 'out'; // 'out' = intracellular→extracellular (default), 'in' = extracellular→intracellular
  pumpPhase?: PumpPhase;   // Animation state machine for pumps
  pumpPhaseProgress?: number; // 0–1 progress within the current phase
}

// ============================================================
// REACTION KINETICS SIMULATION TYPES
// ============================================================

export type ReactantType = 'A' | 'B' | 'Product' | 'Enzyme' | 'Enzyme_Complex';
export type ScenarioMode = 'chemistry' | 'biology';

export interface KineticParticle {
  id: string;
  type: ReactantType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  energy: number; // Kinetic energy roughly
  dead?: boolean;
  /** Enzymes only: true once heat has unfolded the active site. */
  enzymeDenatured?: boolean;
  /** Enzymes only: 0 (folded) to 1 (fully unfolded), drawn as the shape distorting. */
  denaturationProgress?: number;
}

// ============================================================
// FREE BODY DIAGRAM TYPES
// ============================================================

export type FbdForceType =
  | 'gravity' | 'normal' | 'applied' | 'friction_kinetic' | 'friction_static'
  | 'tension' | 'drag' | 'spring' | 'buoyancy' | 'electric' | 'magnetic';

export interface FbdForce {
  id: string;
  type: FbdForceType;
  label: string;
  magnitude: number; // arbitrary units (Newtons)
  angle: number;     // degrees: 0=right, 90=up, 180=left, 270=down
  color: string;
}

export type FbdObjectIcon = 'block' | 'sphere' | 'mass-on-rope' | 'pulley-system';
export type FbdScenarioCategory = 'flat' | 'incline' | 'pulley' | 'vertical';

export type FbdAccelerationState =
  | 'equilibrium'
  | 'accelerating_right'
  | 'accelerating_left'
  | 'accelerating_up'
  | 'accelerating_down'
  | 'down_incline'
  | 'up_incline';

export interface FbdTargetAcceleration {
  state: FbdAccelerationState;
  description: string;
}

export interface FbdScenario {
  id: string;
  title: string;
  description: string;
  category: FbdScenarioCategory;
  objectIcon: FbdObjectIcon;
  inclineAngle?: number;
  expectedForces: Array<Pick<FbdForce, 'type' | 'label' | 'angle'> & { magnitudeRatio?: number }>;
  hint?: string;
  hints?: [string, string, string];
  targetAcceleration?: FbdTargetAcceleration;
  solutionForces?: FbdForce[];
}

export interface FbdVerifyResult {
  correct: FbdForce[];
  missing: string[];         // force type labels that are missing
  extra: FbdForce[];         // forces that shouldn't be here
  misdirected: FbdForce[];   // present but wrong angle
  netForceSatisfied?: boolean;
  netForceFeedback?: string;
}

export interface FbdAiFeedback {
  overallVerdict: string;
  strengths: string[];
  issues: string[];
  teachingPoints: string[];
}

// --- Charades / Pictionary Generator ---

export type CharadesDifficulty = 'easy' | 'medium' | 'hard';
export type CharadesGameMode = 'charades' | 'pictionary';

export interface CharadesCard {
  id: string;
  term: string;
  category: string;
  difficulty: CharadesDifficulty;
  hint?: string;
}

export interface CharadesDeck {
  id: string;
  title: string;
  course: string;
  topic: string;
  gradeLevel: string;
  gameMode?: CharadesGameMode; // optional for back-compat with decks saved before pictionary mode landed
  cards: CharadesCard[];
  createdAt: number;
}

// --- Taboo Generator ---

export interface TabooCard {
  id: string;
  term: string;
  forbiddenWords: string[];
  category: string;
}

export interface TabooDeck {
  id: string;
  title: string;
  course: string;
  topic: string;
  gradeLevel: string;
  forbiddenCount: number; // 3-7
  cards: TabooCard[];
  createdAt: number;
}