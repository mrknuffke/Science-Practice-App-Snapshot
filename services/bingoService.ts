import { CourseType, BingoTerm, BingoBoard } from '../types';
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from './ai/core';

// --- Presets ---

import { BingoSmartPreset } from '../types';

export const BINGO_SMART_PRESETS: BingoSmartPreset[] = [
    {
        id: 'smart-periodic-table',
        name: 'Periodic Table Elements',
        basePromptModifier: 'elements from the periodic table',
        options: [
            {
                id: 'element_range',
                label: 'Elements Included',
                type: 'multiselect',
                choices: [
                    'Elements 1-20 (Common)',
                    'Elements 1-36',
                    'Main Group Elements (s and p blocks)',
                    'Transition Metals (d block)',
                    'Lanthanides and Actinides (f block)',
                    'All 118 Elements'
                ],
                defaultValues: ['Elements 1-20 (Common)']
            },
            {
                id: 'question_types',
                label: 'Types of Clues/Questions',
                type: 'multiselect',
                choices: [
                    'Basic Properties (State of matter, metal/nonmetal)',
                    'Subatomic Particles (Protons, Neutrons, Electrons)',
                    'Atomic Mass',
                    'Basic Electron Configurations',
                    'Expanded Electron Configurations',
                    'Bohr Models',
                    'Common Uses / Historical Facts'
                ],
                defaultValues: ['Basic Properties (State of matter, metal/nonmetal)', 'Common Uses / Historical Facts']
            }
        ]
    },
    {
        id: 'smart-cell-organelles',
        name: 'Cell Organelles',
        basePromptModifier: 'cellular organelles and structures',
        options: [
            {
                id: 'cell_types',
                label: 'Cell Types Included',
                type: 'multiselect',
                choices: [
                    'Prokaryotic Cells (Bacteria/Archaea)',
                    'Eukaryotic: Animal-like Cells',
                    'Eukaryotic: Plant-like Cells',
                    'Fungal Cells'
                ],
                defaultValues: ['Eukaryotic: Animal-like Cells', 'Eukaryotic: Plant-like Cells']
            },
            {
                id: 'focus_areas',
                label: 'Focus Areas',
                type: 'multiselect',
                choices: [
                    'Basic Functions and Definitions',
                    'Structural Descriptions',
                    'Analogies (e.g., "Post Office of the cell")',
                    'Interactions with other organelles',
                    'Diseases related to dysfunction'
                ],
                defaultValues: ['Basic Functions and Definitions', 'Structural Descriptions', 'Analogies (e.g., "Post Office of the cell")']
            }
        ]
    },
    {
        id: 'smart-lab-equipment',
        name: 'Lab Equipment',
        basePromptModifier: 'laboratory equipment, glassware, and tools',
        options: [
            {
                id: 'lab_type',
                label: 'Lab Subject Focus',
                type: 'multiselect',
                choices: [
                    'General Science / Middle School',
                    'Biology Lab (e.g., microscopes, petri dishes)',
                    'Chemistry Lab (e.g., glassware, bunsen burners)',
                    'Physics Lab (e.g., spring scales, motion sensors)'
                ],
                defaultValues: ['Chemistry Lab (e.g., glassware, bunsen burners)']
            },
            {
                id: 'clue_style',
                label: 'Clue Styles',
                type: 'multiselect',
                choices: [
                    'Standard Definitions',
                    'Visual Descriptions (What it looks like)',
                    'Use Cases / Procedures (When to use it)',
                    'Safety Warnings'
                ],
                defaultValues: ['Standard Definitions', 'Use Cases / Procedures (When to use it)']
            }
        ]
    },
    {
        id: 'smart-chemical-compounds',
        name: 'Chemical Compounds',
        basePromptModifier: 'chemical compounds',
        options: [
            {
                id: 'compound_types',
                label: 'Types of Compounds',
                type: 'multiselect',
                choices: [
                    'Binary Ionic Compounds',
                    'Ternary Ionic Compounds (Polyatomic Ions)',
                    'Covalent / Molecular Compounds',
                    'Acids and Bases',
                    'Simple Organic Compounds (Alkanes, Alcohols)'
                ],
                defaultValues: ['Binary Ionic Compounds', 'Covalent / Molecular Compounds']
            },
            {
                id: 'board_terms',
                label: 'What should go on the BINGO board?',
                type: 'select',
                choices: [
                    'Chemical Names (e.g., Sodium Chloride)',
                    'Chemical Formulas (e.g., NaCl)',
                    'A mix of both Names and Formulas'
                ],
                defaultValues: ['Chemical Names (e.g., Sodium Chloride)']
            },
            {
                id: 'clue_types',
                label: 'Types of Clues',
                type: 'multiselect',
                choices: [
                    'Provide the Formula (if name is on board)',
                    'Provide the Name (if formula is on board)',
                    'Common real-world uses',
                    'Constituent elements and their ratios'
                ],
                defaultValues: ['Provide the Formula (if name is on board)', 'Common real-world uses']
            }
        ]
    }
];


// --- Helper Functions ---

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


// --- Generator Logic ---

export const generateBingoBoards = (
    terms: BingoTerm[],
    boardCount: number,
    includeFreeSpace: boolean
): BingoBoard[] => {
    
    // Validate we have enough terms
    const requiredTermCount = includeFreeSpace ? 24 : 25;
    if (terms.length < requiredTermCount) {
        throw new Error(`Not enough terms to fill a BINGO board. You provided ${terms.length}, but we need at least ${requiredTermCount}.`);
    }

    const boards: BingoBoard[] = [];

    for (let i = 0; i < boardCount; i++) {
        // Shuffle terms for this board
        const shuffledTerms = shuffleArray(terms);
        
        // Take the first 24 or 25 terms based on free space
        const selectedTerms = shuffledTerms.slice(0, requiredTermCount);
        
        // Create 2D Array
        const grid: (string | null)[][] = [
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null],
            [null, null, null, null, null]
        ];

        let index = 0;
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                if (includeFreeSpace && row === 2 && col === 2) {
                    grid[row][col] = null; // Free space
                } else {
                    grid[row][col] = selectedTerms[index++].term;
                }
            }
        }

        boards.push({
            id: `board-${Date.now()}-${i}`,
            grid
        });
    }

    return boards;
};


// --- AI Service Calls ---

export const generateBingoTermsFromAI = async (
    course: CourseType,
    topic: string,
    gradeLevel: string,
    count: number = 30,
    additionalRules: string = ''
): Promise<BingoTerm[]> => {
    const prompt = `
    Generate a list of exactly ${count} UNIQUE "Terms" and clues for a BINGO review game.
    Course: ${course}
    Grade Level: ${gradeLevel}
    Topic: ${topic}
    
    IMPORTANT RULES:
    - You must output exactly ${count} terms.
    - Each term MUST be a word or short phrase. No long sentences for the term.
    - Each term must be UNIQUE - no repeated terms.
    - For each term provide AT LEAST 3 distinct, varied clues that a teacher could read out loud.
      - Each clue must provide a hint to the term without outright giving away the answer.
      - Ensure the clues vary in style (e.g. one definition, one real-world application, one structural fact).
    ${additionalRules}
    - Do not number them. Output a raw JSON array of objects.
    
    Format:
    [
        {
            "term": "Chloroplast",
            "clues": [
                "Organelle where photosynthesis occurs.",
                "Found only in plant cells and some protists.",
                "Light is converted into sugar inside the ________."
            ]
        },
        ...
    ]
    `;

    try {
        const result = await callAI(DEFAULT_MODEL, prompt, {
            responseMimeType: "application/json"
        });

        const cleanedText = cleanJsonResponse(result.text || "[]");
        let json = JSON.parse(cleanedText);

        if (!Array.isArray(json)) {
            // Unlikely with gemini JSON mode, but handle edge case
            if (json.terms && Array.isArray(json.terms)) {
                json = json.terms;
            } else {
                 return [];
            }
        }

        // De-duplicate just in case
        const seenTerms = new Set<string>();
        const uniqueTerms = (json as { term?: string; clues?: unknown }[]).filter(item => {
            const termKey = item.term?.toLowerCase()?.trim();
            if (!termKey) return false;
            if (seenTerms.has(termKey)) return false;
            seenTerms.add(termKey);
            return true;
        });

        return uniqueTerms.map((item, index) => ({
            id: `bingo-term-${Date.now()}-${index}`,
            term: item.term ?? '', // the filter above drops items without a term
            clues: Array.isArray(item.clues) ? item.clues.filter((c): c is string => typeof c === 'string') : []
        }));

    } catch (e) {
        console.error("AI Bingo Term Gen Failed", e);
        throw new Error("Failed to generate BINGO terms from AI. Please try again or use a simpler topic.");
    }
};

export const generateSmartPresetTerms = async (
    presetId: string,
    gradeLevel: string,
    configSelections: Record<string, string[]> // map of option id -> array of selected values
): Promise<BingoTerm[]> => {
    
    const preset = BINGO_SMART_PRESETS.find(p => p.id === presetId);
    if (!preset) throw new Error("Smart Preset not found");

    // Convert the config selections into a human-readable list of rules for the AI prompt
    const ruleStrings = preset.options.map(opt => {
        const userSelections = configSelections[opt.id] || opt.defaultValues;
        if (userSelections.length === 0) return '';
        
        return `- Regarding "${opt.label}": MUST focus on or include the following: ${userSelections.join(', ')}.`;
    }).filter(s => s.length > 0);

    const rulesBlock = `
    SMART PRESET SPECIFIC RULES:
    ${ruleStrings.join('\n    ')}
    `;

    return generateBingoTermsFromAI(
        'Science' as CourseType,
        preset.basePromptModifier,
        gradeLevel,
        30,
        rulesBlock
    );
};

const SINGLE_BINGO_TERM_FORMAT = `
Format:
{
    "term": "Chloroplast",
    "clues": [
        "Organelle where photosynthesis occurs.",
        "Found only in plant cells and some protists.",
        "Light is converted into sugar inside the ________."
    ]
}`;

export const refreshBingoTerm = async (
    course: CourseType,
    topic: string,
    gradeLevel: string,
    existingTerms: string[],
    teacherNotes: string = ''
): Promise<BingoTerm> => {
    const prompt = `
Generate ONE replacement BINGO term for a review game.
Course: ${course}
Grade Level: ${gradeLevel}
Topic: ${topic}

AVOID these terms (already on the board):
${existingTerms.map(t => `- ${t}`).join('\n')}

${teacherNotes ? `TEACHER NOTES: ${teacherNotes}\n` : ''}
RULES:
- Term must be a unique word or short phrase, different from every entry above.
- Provide AT LEAST 3 distinct, varied clues (definition, application, structural fact, etc.).
- Clues should hint at the term without revealing it.
- Output a single raw JSON object (not an array).
${SINGLE_BINGO_TERM_FORMAT}
`;

    const result = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json"
    });
    const parsed = JSON.parse(cleanJsonResponse(result.text || "{}"));
    return {
        id: `bingo-term-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        term: parsed.term || 'Untitled',
        clues: Array.isArray(parsed.clues) ? parsed.clues : []
    };
};

export const reviseBingoTerm = async (
    course: CourseType,
    topic: string,
    gradeLevel: string,
    term: BingoTerm,
    teacherNotes: string
): Promise<BingoTerm> => {
    const prompt = `
Revise an existing BINGO term per teacher notes.
Course: ${course}
Grade Level: ${gradeLevel}
Topic: ${topic}

CURRENT TERM:
Term: ${term.term}
Clues:
${term.clues.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

TEACHER NOTES:
"${teacherNotes}"

TASK:
Apply the teacher's notes. You may keep the same term or pick a closely-related substitute if the notes call for it. Provide AT LEAST 3 varied clues.
Output a single raw JSON object.
${SINGLE_BINGO_TERM_FORMAT}
`;

    const result = await callAI(DEFAULT_MODEL, prompt, {
        responseMimeType: "application/json"
    });
    const parsed = JSON.parse(cleanJsonResponse(result.text || "{}"));
    return {
        id: term.id,
        term: parsed.term || term.term,
        clues: Array.isArray(parsed.clues) ? parsed.clues : term.clues
    };
};
