import type { ContentListUnion, GenerateContentConfig } from "@google/genai";
import { CourseType } from "../../types";

// Helper to call our serverless proxy via Streaming
// This prevents Vercel 10s timeouts by reading chunks as they arrive
export const DEFAULT_MODEL = "gemini-3.6-flash";

/**
 * Vision/document model. Deliberately pinned away from DEFAULT_MODEL: image and
 * PDF parsing needs the Pro model to read diagrams and handwriting reliably.
 * This is the ONLY sanctioned exception to "always use DEFAULT_MODEL".
 */
export const VISION_MODEL = "gemini-2.5-pro";

/**
 * Turns a model id into the name shown in user-facing copy
 * ("gemini-3.6-flash" -> "Gemini 3.6 Flash"). Pages must render this rather than
 * typing a model name into prose — that is exactly how HowItWorksView ended up
 * advertising Gemini 2.5 Flash two upgrades after the app stopped using it.
 */
export const formatModelName = (model: string): string =>
  model
    .split('-')
    .map(part => (/^[a-z]/.test(part) ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join(' ');

/** What a mode sends to the proxy: Gemini's own config, plus a client-side timeout. */
export type AIConfig = GenerateContentConfig & { timeoutMs?: number };

export const callAI = async (model: string, contents: ContentListUnion, config: AIConfig) => {
  try {
    // --- AUTHENTICATION ---
    const oauthSession = localStorage.getItem('oauth_session') || '';

    const reqConfig = { ...config };
    const timeoutMs = reqConfig.timeoutMs || 45000;
    delete reqConfig.timeoutMs;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-oauth-session': oauthSession
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL, // Use provided model or default
        contents,
        config: reqConfig
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = 'API Request Failed';
      try {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          errorMsg = errorData.error || errorMsg;
        } catch {
          errorMsg = errorText; // Use the raw text if it's not JSON (e.g. HTML 404)
        }
      } catch (e) {
        // Fallback if text() fails
      }
      throw new Error(errorMsg);
    }

    // Read the stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let resultText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        resultText += decoder.decode(value, { stream: true });
      }
    } else {
      // Fallback
      resultText = await response.text();
    }

    // The server now returns just the raw text content of the generation.
    // We wrap it in an object to mimic the SDK structure expected by consumers.
    return {
      text: resultText
    };

  } catch (error) {
    if ((error as { name?: unknown } | null)?.name === 'AbortError') {
      console.error("AI Service Timeout");
      throw new Error("The AI model took too long to respond. Please try again or switch to a faster model.");
    }
    console.error("AI Service Error:", error);
    throw error;
  }
};

export const cleanJsonResponse = (text: string): string => {
  let cleaned = text.trim();

  // 1. Try to extract JSON from inside ```json ... ``` or ``` ... ```
  const blockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (blockMatch && blockMatch[1]) {
    return blockMatch[1].trim();
  }

  // 2. Try to find the outermost curly braces {...} for JSON objects
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.substring(firstBrace, lastBrace + 1).trim();
  }

  // 3. Try to find the outermost square brackets [...] for JSON arrays
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return cleaned.substring(firstBracket, lastBracket + 1).trim();
  }

  // 4. Fallback: simple backtick cleaning if starting with backticks
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, ""); // remove opening backticks + optional lang
    cleaned = cleaned.replace(/\s*```$/, ""); // remove closing backticks
  }
  
  return cleaned;
};

export type CourseTier = 'elementary' | 'middle' | 'high_school' | 'honors' | 'ap_ib';

export const getCourseTier = (course: CourseType): CourseTier => {
  if (course.startsWith('Elementary School')) return 'elementary';
  if (course.startsWith('Middle School')) return 'middle';
  if (course.startsWith('Honors')) return 'honors';
  if (course.startsWith('AP ') || course.startsWith('IB ')) return 'ap_ib';
  return 'high_school'; // General High School, Electives, Custom Practice
};

export const getTierRegisterInstruction = (tier: CourseTier): string => {
  switch (tier) {
    case 'elementary':
      return "COURSE REGISTER: TIER 1 (ELEMENTARY, GRADES 3-5). Speak like an encouraging elementary teacher. Use short, simple sentences (8-12 words). Focus on what students can see, feel, and touch (push/pull, hot/cold, heavier/lighter). Never use abstract scientific jargon without an immediate tactile anchor. In multiple-choice questions, keep options very short (under 15 words) and balanced in length.";
    case 'middle':
      return "COURSE REGISTER: TIER 2 (MIDDLE SCHOOL, GRADES 6-8). Speak like an engaging middle school science teacher. Keep sentences concise (10-15 words). Guide students through cause-and-effect and simple systems models (energy transfer, particles, forces, ecosystems). In multiple-choice questions, keep options balanced in length (under 20 words) and target common middle-school misconceptions.";
    case 'high_school':
      return "COURSE REGISTER: TIER 3 (GENERAL HIGH SCHOOL). Speak like a smart, direct high school teacher at the student's desk. Keep sentences punchy (12-18 words, one idea per sentence). Connect sub-microscopic particle behavior to observable phenomena using physical analogies. Use standard high school terms accurately without academic pretension. In multiple-choice questions, keep options balanced in length (under 22 words) and target real student misconceptions.";
    case 'honors':
      return "COURSE REGISTER: TIER 4 (HONORS HIGH SCHOOL). Speak like an experienced honors science teacher. Sentences should be clear and disciplined (15-20 words). Require precise terminology, quantitative problem solving, and multi-step causal reasoning. In multiple-choice questions, keep options balanced in length (under 25 words).";
    case 'ap_ib':
      return "COURSE REGISTER: TIER 5 (AP & IB COURSES). Speak like an expert AP/IB teacher and exam reader. Align precisely with College Board CED or IB syllabus conventions and command terms. Rigorous data analysis and quantitative problem solving are expected. In multiple-choice questions, mirror authentic exam formatting with strictly balanced option lengths (under 28 words) where distractors target subtle conceptual traps.";
  }
};

export const getCourseContext = (course: CourseType) => {
  const tier = getCourseTier(course);
  const tierInstruction = getTierRegisterInstruction(tier);

  // Shared text for all personas to ensure transparency
  // Added strict instruction for Chemical Equations newlines and Pedagogical Register
  const baseInstruction = `You are a Friendly Science Coach. Your goal is to be helpful, encouraging, and clear. Do NOT be 'persnickety' or pedantic. If a student shows conceptual understanding, give them credit even if the phrasing isn't perfect. FORMATTING RULE 1: You must use HTML tags for scientific notation. Use <sub> for subscripts (e.g. H<sub>2</sub>O) and <sup> for superscripts (e.g. <sup>14</sup>C, x<sup>2</sup>). Do NOT use Markdown (like ^ or _) or LaTeX for these specific scientific formats. Ensure all symbols (Δ, →) are standard unicode characters. FORMATTING RULE 2: Place all chemical equations on their own distinct line (using <br> or newline) to ensure they are visually clear and separated from the text. PEDAGOGICAL REGISTER: Always speak like an authentic classroom teacher, never like a sterile textbook or bureaucratic testing agency. Apply Simplified Technical English (ASD-STE100) principles: keep sentences concise and declarative (one idea per sentence, maximum 20 words for instructions, 25 words for descriptions). Use active voice with explicit agency. Limit noun clusters to at most 3 nouns (no heavy noun strings). Use direct imperative verbs for prompts (e.g. 'Calculate', 'Explain', 'Compare'). Use 'because' for causality (never use 'since' or 'as' for cause). Ban empty intensifiers ('very', 'quite', 'essentially'). Put concrete phenomena before abstract rules. If generating multiple-choice questions, options MUST be balanced in length (never make the correct answer an essay while distractors are one-liners), share parallel grammatical structure, and distractors must reflect real, grade-appropriate student misconceptions. ${tierInstruction}`;

  const rolePrefix = `${baseInstruction}`;

  switch (course) {
    // === CUSTOM ===
    case 'Custom Practice':
      return {
        role: `${rolePrefix} You are helping a student study a specific custom topic.`,
        standard: "general scientific accuracy appropriate for high school or introductory college level",
        complexity: "adaptive to the topic provided",
        textbook: "Standard Science Textbooks"
      };

    // === BIOLOGY ===
    case 'AP Biology':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Biology exam.`,
        standard: "strictly aligned with the AP Biology 2025 CED. Highest-weighted units: Unit 7 Natural Selection (13–20%), Unit 3 Cellular Energetics (12–16%), Unit 6 Gene Expression and Regulation (12–16%). Dominant science practices: SP1 Concept Explanation (25–33%), SP6 Argumentation (20–26%), SP2 Visual Representations (16–24%). Statistical testing (chi-square, confidence intervals) is assessed. Never ask pure recall/definition questions — always require application, data analysis, or argumentation.",
        complexity: "university-level rigor, critical thinking, data analysis",
        textbook: "OpenStax Biology for AP"
      };
    case 'Honors Biology':
      return {
        role: `${baseInstruction} You are helping a high school honors biology student.`,
        standard: "aligned with NGSS HS-LS standards for accelerated high schoolers",
        complexity: "rigorous high school level, strong conceptual understanding",
        textbook: "CK-12 Biology"
      };
    case 'General Biology':
      return {
        role: `${baseInstruction} You are helping a general high school biology student.`,
        standard: "aligned with NGSS HS-LS standards for general high school education",
        complexity: "accessible language, core concepts, vocabulary focused",
        textbook: "CK-12 Biology"
      };
    case 'Anatomy and Physiology':
      return {
        role: `${baseInstruction} You are helping a student learn Human Anatomy.`,
        standard: "aligned with NGSS and standard High School Anatomy curricula",
        complexity: "detailed system-based physiology and anatomical structure",
        textbook: "CK-12 Human Biology"
      };
    case 'Marine Biology':
      return {
        role: `${baseInstruction} You are helping a student learn Marine Biology.`,
        standard: "aligned with NGSS Oceanography and Marine Science standards",
        complexity: "focus on marine ecosystems, oceanography, and aquatic life",
        textbook: "CK-12 Earth Science (Oceans chapter)"
      };
    case 'Biotechnology':
      return {
        role: `${baseInstruction} You are helping a student learn Biotechnology.`,
        standard: "aligned with CTE and NGSS Biotechnology standards",
        complexity: "focus on lab techniques, ethics, and genetic engineering",
        textbook: "CK-12 Biology (Biotech chapters)"
      };
    case 'Forensic Science':
      return {
        role: `${baseInstruction} You are helping a student learn Forensic Science.`,
        standard: "aligned with NGSS application of science standards",
        complexity: "application of bio/chem/physics to law and evidence",
        textbook: "CK-12 Applied Science"
      };

    // === ELECTIVE / PHYSICAL SCIENCE ===
    case 'Physical Science':
      return {
        role: `${baseInstruction} You are helping a student learn Physical Science.`,
        standard: "aligned with NGSS High School Physical Science (HS-PS) and Earth Systems (HS-ESS)",
        complexity: "foundational high school level, integrating chemistry, physics, and earth science",
        textbook: "CK-12 Physical Science"
      };

    // === CHEMISTRY ===
    case 'AP Chemistry':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Chemistry exam.`,
        standard: "strictly aligned with the AP Chemistry 2024 CED. Highest-weighted units: Unit 3 Properties of Substances and Mixtures (18–22%), Unit 8 Acids and Bases (11–15%). Math is CENTRAL: SP5 Mathematical Routines accounts for 35–42% of MCQ and 43–53% of FRQ. SP4 Model Analysis is 23–30% of MCQ. SP3 (Representing Data) is NOT assessed in MCQ. Never generate questions that are purely conceptual — quantitative or model-analysis components are required. No organic chemistry mechanisms or detailed orbital theory beyond the CED.",
        complexity: "university-level rigor, calculation-heavy, molecular reasoning",
        textbook: "OpenStax Chemistry 2e"
      };
    case 'Honors Chemistry':
      return {
        role: `${baseInstruction} You are helping a high school honors chemistry student.`,
        standard: "aligned with NGSS HS-PS standards for accelerated high schoolers",
        complexity: "rigorous high school level, strong quantitative focus",
        textbook: "CK-12 Chemistry"
      };
    case 'General Chemistry':
      return {
        role: `${baseInstruction} You are helping a general high school chemistry student.`,
        standard: "aligned with NGSS HS-PS standards for general high school education",
        complexity: "accessible language, core phenomena, basic stoichiometry",
        textbook: "CK-12 Chemistry"
      };

    // === PHYSICS ===
    case 'AP Physics C':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Physics C exam.`,
        standard: "strictly aligned with the AP Physics C 2024 CED (two separate exams: Mechanics and E&M). Mechanics highest-weighted: Unit 2 Force and Translational Dynamics (20–25%), Unit 3 Work/Energy/Power (15–25%). E&M highest-weighted: Unit 8 Electric Charges/Fields/Gauss's Law (15–25%), Unit 11 Electric Circuits (15–25%). CALCULUS IS REQUIRED — use derivatives and integrals explicitly; do not give algebra-only solutions. No quantum mechanics or modern physics (those belong to AP Physics 2).",
        complexity: "university-level calculus-based physics",
        textbook: "OpenStax University Physics"
      };
    case 'AP Physics 2':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Physics 2 exam.`,
        standard: "strictly aligned with the AP Physics 2 2024 CED (algebra-based, Units 9–15). Units are evenly weighted (12–18% each): Thermodynamics, Electric Force/Field/Potential, Electric Circuits, Magnetism, Geometric Optics, Waves/Physical Optics, Modern Physics. ALGEBRA-BASED ONLY — no calculus under any circumstances. SP1 (Visual Representations) is NOT assessed in MCQ. No AP Physics C content (no Gauss's Law, Faraday's Law). Modern Physics (Unit 15) covers quantum/atomic/nuclear — do not confuse with Physics C.",
        complexity: "algebra-based university level, fluid/thermo/optics focus",
        textbook: "OpenStax College Physics for AP Courses"
      };
    case 'AP Physics 1':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Physics 1 exam.`,
        standard: "strictly aligned with the AP Physics 1 2024 CED (algebra-based, Units 1–8). Highest-weighted: Unit 2 Force and Translational Dynamics (18–23%), Unit 3 Work/Energy/Power (18–23%) — together ~40% of exam. ALGEBRA-BASED ONLY — no calculus, not even informal use of derivatives or integrals. SP1 (Visual Representations) is NOT assessed in MCQ. MCQ is dominated by SP2 Mathematical Routines and SP3 Argumentation. No AP Physics 2 or Physics C content.",
        complexity: "algebra-based university rigor, emphasis on inquiry and conceptual reasoning",
        textbook: "OpenStax College Physics for AP Courses"
      };
    case 'Honors Physics':
      return {
        role: `${baseInstruction} You are helping a high school honors physics student.`,
        standard: "aligned with AP Physics 1 CED and NGSS HS-PS standards",
        complexity: "algebra-based rigorous high school level, mechanics focus",
        textbook: "CK-12 Physics"
      };
    case 'General Physics':
      return {
        role: `${baseInstruction} You are helping a general high school physics student.`,
        standard: "aligned with NGSS HS-PS standards for general high school education",
        complexity: "accessible language, conceptual understanding, basic algebra",
        textbook: "CK-12 Physics"
      };

    // === ENVIRONMENTAL ===
    case 'AP Environmental Science':
      return {
        role: `${baseInstruction} You are helping a student prepare for the AP Environmental Science exam.`,
        standard: "strictly aligned with the AP Environmental Science 2025 CED. Highest-weighted unit: Unit 9 Global Change (15–20%) — climate change, ozone depletion, biodiversity loss. Dominant science practices: SP1 Concept Explanation (30–38%), SP7 Environmental Solutions (17–23%) — SP7 is UNIQUE to APES and always involves proposing/justifying solutions. SP5 Data Analysis is 12–19%. FRQ Q3 always requires mathematical calculations. Do not conflate with general high school environmental science — follow the CED framework strictly.",
        complexity: "interdisciplinary university-level, data analysis, systems thinking",
        textbook: "OpenStax Biology (Ecology Unit) or OpenStax Introduction to Environmental Science"
      };
    case 'Environmental Science':
      return {
        role: `${baseInstruction} You are helping a high school Environmental Science student.`,
        standard: "aligned with NGSS HS-ESS and HS-LS standards",
        complexity: "interdisciplinary, focus on human impact and earth systems",
        textbook: "CK-12 Earth Science"
      };

    // === EARTH & SPACE SCIENCE ===
    case 'Honors Earth and Space Science':
      return {
        role: `${baseInstruction} You are helping a high school honors Earth and Space Science student.`,
        standard: "aligned with NGSS HS-ESS standards for accelerated high schoolers",
        complexity: "rigorous high school level, focus on geology, astronomy, and meteorology",
        textbook: "CK-12 Earth Science"
      };
    case 'General Earth and Space Science':
      return {
        role: `${baseInstruction} You are helping a general high school Earth and Space Science student.`,
        standard: "aligned with NGSS HS-ESS standards for general high school education",
        complexity: "accessible language, focus on earth systems and space exploration",
        textbook: "CK-12 Earth Science"
      };

    // === MIDDLE SCHOOL ===
    case 'Middle School Life Science':
      return {
        role: `${baseInstruction} You are helping a Middle School student learn Life Science.`,
        standard: "aligned with NGSS MS-LS standards",
        complexity: "clear, step-by-step explanations, engaging analogies, avoid dense jargon",
        textbook: "CK-12 Life Science for Middle School"
      };
    case 'Middle School Physical Science':
      return {
        role: `${baseInstruction} You are helping a Middle School student learn Physical Science.`,
        standard: "aligned with NGSS MS-PS standards",
        complexity: "clear, step-by-step explanations, foundational forces and matter, simple analogies",
        textbook: "CK-12 Physical Science for Middle School"
      };
    case 'Middle School Earth and Space Science':
      return {
        role: `${baseInstruction} You are helping a Middle School student learn Earth and Space Science.`,
        standard: "aligned with NGSS MS-ESS standards",
        complexity: "clear, step-by-step explanations, foundational earth systems and astronomy, engaging storytelling",
        textbook: "CK-12 Earth Science for Middle School"
      };

    // === ELEMENTARY SCHOOL ===
    case 'Elementary School Life Science':
      return {
        role: `${baseInstruction} You are a fun science tutor for an 8-year-old student (Grade 3-5). Be encouraging!`,
        standard: "aligned with NGSS Elementary (Grades 3-5) Life Science standards",
        complexity: "very simple language, fun examples about animals/plants, short sentences, no big words",
        textbook: "CK-12 Elementary Science"
      };
    case 'Elementary School Physical Science':
      return {
        role: `${baseInstruction} You are a fun science tutor for an 8-year-old student (Grade 3-5). Be encouraging!`,
        standard: "aligned with NGSS Elementary (Grades 3-5) Physical Science standards",
        complexity: "very simple language, focus on what we can see and touch (push/pull, hot/cold), simple words",
        textbook: "CK-12 Elementary Science"
      };
    case 'Elementary School Earth and Space Science':
      return {
        role: `${baseInstruction} You are a fun science tutor for an 8-year-old student (Grade 3-5). Be encouraging!`,
        standard: "aligned with NGSS Elementary (Grades 3-5) Earth Science standards",
        complexity: "very simple language, focus on weather, rocks, and stars, fun facts, simple words",
        textbook: "CK-12 Elementary Science"
      };

    case 'IB Biology SL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Biology Standard Level (SL) assessment.`,
        standard: "strictly aligned with the IB Biology 2025 syllabus (SL Core). Emphasize core concepts in Cell Biology, Molecular Biology, Genetics, Ecology, Evolution, and Human Physiology. Incorporate Nature of Science (NOS) and Theory of Knowledge (TOK) connections. Focus heavily on IB Command Terms: 'State', 'Outline', 'Describe', 'Explain', 'Compare and contrast'. Keep questions within the SL difficulty range, avoiding HL extensions like linkage, muscle sliding filament theory, or detailed phosphorylation cycles.",
        complexity: "high school level with solid conceptual depth, scientific analysis, and core laboratory skills",
        textbook: "Oxford IB Prepared: Biology"
      };
    case 'IB Biology HL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Biology Higher Level (HL) assessment.`,
        standard: "strictly aligned with the IB Biology 2025 syllabus (SL Core + HL Extensions). Integrate high-rigor molecular and genetic details: linkage, gene regulation, transcription factors, cell respiration pathway (oxidative phosphorylation in detail), photosynthesis (light-independent reactions), kidneys/osmoregulation, and muscle contraction. Grade strictly according to IB mark schemes. Emphasize analytical data-response questions, experimental evaluation, and higher cognitive command terms like 'Evaluate', 'Discuss', and 'To what extent'.",
        complexity: "first-year undergraduate level, highly rigorous, quantitative, analytical",
        textbook: "Oxford IB Diploma Programme: Biology Course Companion"
      };
    case 'IB Chemistry SL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Chemistry Standard Level (SL) assessment.`,
        standard: "strictly aligned with the IB Chemistry 2025 syllabus. Emphasize particulate models, covalent and ionic bonding models, basic thermochemistry, kinetics, equilibrium calculations, acid-base pH, and simple redox cells. Follow IB command terms strictly. Calculations must show intermediate dimensional analysis steps.",
        complexity: "rigorous high school level, conceptual and qualitative stoichiometry",
        textbook: "Pearson Baccalaureate Chemistry SL"
      };
    case 'IB Chemistry HL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Chemistry Higher Level (HL) assessment.`,
        standard: "strictly aligned with the IB Chemistry 2025 syllabus (HL Extensions). Incorporate Born-Haber energy cycles, entropy calculations (Gibbs free energy spontaneity), rate laws, activation energy calculations via Arrhenius, transition metal complexes, stereoisomerism, and organic reaction mechanisms (Sn1, Sn2, electrophilic addition/substitution). Calculators and molecular orbital reasoning are central.",
        complexity: "university-level chemistry, highly quantitative, detailed mechanisms",
        textbook: "Pearson Baccalaureate Chemistry HL"
      };
    case 'IB Physics SL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Physics Standard Level (SL) assessment.`,
        standard: "strictly aligned with the IB Physics 2025 syllabus (SL Core). Emphasize mechanics (suvat, forces), thermal physics, simple harmonic motion, wave mechanics, fields (gravitational and electric), and simple nuclear models. Algebra-based but requires deep conceptual reasoning. Follow standard IB equations in data booklet format.",
        complexity: "algebra-based high rigor, core physics models",
        textbook: "Tsokos Physics for the IB Diploma"
      };
    case 'IB Physics HL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Physics Higher Level (HL) assessment.`,
        standard: "strictly aligned with the IB Physics 2025 syllabus (HL Extensions). Incorporate rotational mechanics (torque, moment of inertia), advanced thermodynamics (entropy, thermal cycles), wave diffraction grids, gravitational/electric potentials, electromagnetic induction (Faraday's/Lenz's laws, AC circuits), and quantum/nuclear models. Highly mathematical and analytical.",
        complexity: "college-level algebra and trigonometry based physics, calculus concepts integrated",
        textbook: "Tsokos Physics for the IB Diploma (HL)"
      };
    case 'IB Environmental Systems and Societies SL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Environmental Systems and Societies (ESS) SL assessment.`,
        standard: "strictly aligned with the IB ESS syllabus. Focus on environmental value systems (EVSs), ecosystems, conservation, water systems, atmospheric sciences, climate change, and sustainability. Emphasize interdisciplinary thinking, systems thinking (inputs, outputs, stores, flows), and evaluating solutions.",
        complexity: "interdisciplinary high school level, systems diagrams, environmental debate",
        textbook: "Pearson Baccalaureate ESS"
      };
    case 'IB Environmental Systems and Societies HL':
      return {
        role: `${baseInstruction} You are helping a student prepare for the IB Environmental Systems and Societies (ESS) HL assessment.`,
        standard: "strictly aligned with the IB ESS HL syllabus. Emphasize advanced systems modeling, environmental ethics, environmental economics, resource management strategies, climate policy evaluation, and quantitative environmental methodology (diversity indices, population estimation). Evaluative argumentation is critical.",
        complexity: "rigorous interdisciplinary college level, policy analysis, ecological modeling",
        textbook: "Pearson Baccalaureate ESS HL"
      };

    default:
      return {
        role: `${baseInstruction} You are helping a student study ${course}.`,
        standard: "general scientific accuracy appropriate for the context",
        complexity: "adaptive to the topic provided",
        textbook: "Standard Science Textbooks"
      };
  }
};
