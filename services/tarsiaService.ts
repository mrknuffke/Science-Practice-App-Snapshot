import { CourseType } from '../types';
import { callAI, cleanJsonResponse, DEFAULT_MODEL } from './ai/core';

// --- Types ---

export type GridSize = 3 | 4 | 5;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TarsiaPair {
    id: string;
    term: string;
    match: string;
}

export interface TarsiaSquare {
    id: string;
    center: string | null;
    top: string | null;
    right: string | null;
    bottom: string | null;
    left: string | null;
    rotation: 0 | 90 | 180 | 270;
}

export interface TarsiaGrid {
    squares: TarsiaSquare[]; // Scrambled list of squares
    solution: TarsiaSquare[][]; // 2D array of solution [row][col]
    pairs: TarsiaPair[];
}


// --- Helper Functions ---

const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

// --- Main Service Logic ---

export const generateTarsiaPuzzle = (
    pairs: TarsiaPair[],
    size: GridSize,
    difficulty: Difficulty
): TarsiaGrid => {
    // 1. Calculate Edges
    // A grid of W x H has:
    // Vertical Internal Edges: H * (W - 1)
    // Horizontal Internal Edges: W * (H - 1)
    // Total Internal Edges = H(W-1) + W(H-1)

    const width = size;
    const height = size;

    const verticalInternalEdges = height * (width - 1);
    const horizontalInternalEdges = width * (height - 1);
    const requiredPairs = verticalInternalEdges + horizontalInternalEdges;

    if (pairs.length < requiredPairs) {
        throw new Error(`Not enough pairs. Need ${requiredPairs}, got ${pairs.length}.`);
    }

    // Use only the required number of pairs (shuffled)
    const shuffledPairs = shuffleArray(pairs);
    const activePairs = shuffledPairs.slice(0, requiredPairs);
    const unusedPairs = shuffledPairs.slice(requiredPairs); // Extra pairs for Medium difficulty
    let pairIndex = 0;
    let unusedIndex = 0;

    // 2. Initialize Empty Solution Grid
    const solutionGrid: TarsiaSquare[][] = [];
    for (let r = 0; r < height; r++) {
        const row: TarsiaSquare[] = [];
        for (let c = 0; c < width; c++) {
            row.push({
                id: `sq-${r}-${c}`,
                center: null,
                top: null,
                right: null,
                bottom: null,
                left: null,
                rotation: 0
            });
        }
        solutionGrid.push(row);
    }

    // 3. Fill Internal Edges
    // We iterate through the grid and assign Right and Bottom edges
    // The neighbor's Left and Top will match respectively.

    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            // Right Edge (if not last col)
            if (c < width - 1) {
                const pair = activePairs[pairIndex++];
                solutionGrid[r][c].right = pair.term;
                solutionGrid[r][c + 1].left = pair.match;
            }

            // Bottom Edge (if not last row)
            if (r < height - 1) {
                const pair = activePairs[pairIndex++];
                solutionGrid[r][c].bottom = pair.term;
                solutionGrid[r + 1][c].top = pair.match;
            }
        }
    }

    // 4. Fill Outer Edges (Difficulty)
    const getEdgeContent = (diff: Difficulty): string | null => {
        if (diff === 'easy') {
            // Blank edges - easiest to identify corners/edges
            return null;
        }

        if (diff === 'medium') {
            // Unmatched terms from unused pairs - topic-related but no match in puzzle
            if (unusedPairs.length > 0) {
                const pair = unusedPairs[unusedIndex % unusedPairs.length];
                unusedIndex++;
                // Return just the term (its match is NOT in the puzzle)
                return Math.random() > 0.5 ? pair.term : pair.match;
            }
            // Fallback if no unused pairs available
            return null;
        }

        // Hard: Pick a random term/match from ACTIVE pairs to create confusing false leads
        const randomPair = activePairs[Math.floor(Math.random() * activePairs.length)];
        return Math.random() > 0.5 ? randomPair.term : randomPair.match;
    };

    // Iterate again to fill nulls (outer edges)
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            if (solutionGrid[r][c].top === null) solutionGrid[r][c].top = getEdgeContent(difficulty);
            if (solutionGrid[r][c].bottom === null) solutionGrid[r][c].bottom = getEdgeContent(difficulty);
            if (solutionGrid[r][c].left === null) solutionGrid[r][c].left = getEdgeContent(difficulty);
            if (solutionGrid[r][c].right === null) solutionGrid[r][c].right = getEdgeContent(difficulty);
        }
    }


    // 5. Create Scrambled List
    const squares: TarsiaSquare[] = [];
    solutionGrid.forEach(row => {
        row.forEach(sq => {
            // Clone to avoid ref issues
            const newSq = { ...sq };

            // Random Rotation
            const rotations = Math.floor(Math.random() * 4); // 0, 1, 2, 3
            for (let i = 0; i < rotations; i++) {
                // Rotate Clockwise: Top->Right, Right->Bottom, Bottom->Left, Left->Top
                const oldTop = newSq.top;
                newSq.top = newSq.left;
                newSq.left = newSq.bottom;
                newSq.bottom = newSq.right;
                newSq.right = oldTop;
            }
            newSq.rotation = (rotations * 90) as 0 | 90 | 180 | 270;

            squares.push(newSq);
        });
    });

    const shuffled = shuffleArray(squares);

    // Assign Letters (A, B, C...) to the scrambled pieces to help identification
    const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const idToLetter = new Map<string, string>();

    shuffled.forEach((sq, i) => {
        const letter = i < 26 ? labels[i] : `${labels[i % 26]}${Math.floor(i / 26)}`;
        sq.center = letter;
        idToLetter.set(sq.id, letter);
    });

    // Map id -> rotation of scrambled piece
    const idToRotation = new Map<string, 0 | 90 | 180 | 270>();
    shuffled.forEach(sq => idToRotation.set(sq.id, sq.rotation));

    // Back-fill the solution grid with the same letters and rotations for the Answer Key
    solutionGrid.forEach(row => row.forEach(sq => {
        if (idToLetter.has(sq.id)) sq.center = idToLetter.get(sq.id)!;
        if (idToRotation.has(sq.id)) sq.rotation = idToRotation.get(sq.id)!;
    }));

    return {
        squares: shuffled,
        solution: solutionGrid,
        pairs: activePairs
    };
};

// --- AI Generation helper ---
export const generateTarsiaPairsFromAI = async (
    course: CourseType,
    topic: string,
    gradeLevel: string,
    count: number,
    silliness: number = 0, // 0 to 100
    sourceContext: string = "",
    mathMix: number = 0 // 0 to 100 percentage of math problems
): Promise<TarsiaPair[]> => {
    // We need a lot of pairs. 
    // 3x3 needs 12
    // 4x4 needs 24
    // 5x5 needs 40
    // We should ask for count + 10 buffer.

    let sillyInstructions = "";
    if (silliness > 0) {
        if (silliness <= 33) {
            // Light Silliness
            sillyInstructions = `
                STYLE: Lighthearted & Friendly
                - Use a casual, friendly tone.
                - Add relevant emojis to about 25% of terms/matches (e.g. "ATP ⚡").
                - Keep definitions accurate but simple.
            `;
        } else if (silliness <= 66) {
            // Moderate Silliness
            sillyInstructions = `
                STYLE: Fun & Punny
                - Incorporate science puns/jokes in about 50% of the pairs.
                - Example: "Mitosis" -> "Cell-fie Time 🤳"
                - Use emojis liberally.
                - Make half the matches unexpected but correct descriptions.
            `;
        } else {
            // Maximum Silliness
            sillyInstructions = `
                STYLE: MAXIMUM CHAOS & HUMOR
                - PRIORITY: MAKE THE STUDENT LAUGH.
                - Every pair should be a joke, pun, or pop-culture reference if possible.
                - "Mitochondria" -> "The Powerhouse (Meme) 🔋"
                - "Gravity" -> "The Law You Can't Break 📉"
                - Use emojis EVERYWHERE.
                - Be absurd but factually grounded.
            `;
        }
    }

    const mathInstructions = mathMix > 0 ? `
        IMPORTANT: You MUST include calculation/math problems.
        - Approximately ${mathMix}% of the pairs MUST be math/calculation problems.
        - Format for math pairs: "Term" is the PROBLEM, "Match" is the ANSWER (with units).
        - Examples of math pairs:
          - {"term": "Density of 10g/2mL", "match": "5 g/mL"}
          - {"term": "Molar Mass of H2O", "match": "18.02 g/mol"}
          - {"term": "Force if m=10kg a=2m/s^2", "match": "20 N"}
        - The remaining ${100 - mathMix}% should be standard definitions/concepts.
    ` : 'Generate standard term/definition pairs.';

    const contextPrompt = sourceContext
        ? `\n\nPRIORITY CONTEXT: Generate pairs based on the following source material. Terms and matches should directly relate to concepts found here:\n"${sourceContext.substring(0, 3000)}..."\n`
        : "";

    try {
        const prompt = `
        Generate ${count} DISTINCT and UNIQUE "Term" and "Match" pairs for a science review puzzle.
        Course: ${course}
        Grade Level: ${gradeLevel}
        Topic: ${topic}
        ${sillyInstructions}
        ${mathInstructions}
        ${contextPrompt}
        
        IMPORTANT RULES:
        - Each term must be UNIQUE - no repeated terms
        - Each match must be UNIQUE - no repeated matches  
        - Pairs must be short and concise (1-4 words max) to fit on the edge of a small square puzzle piece
        - Do not number them. Just provide the JSON array.
        
        Format:
        [
            {"term": "Mitosis", "match": "Cell Division"},
            {"term": "Au", "match": "Gold"},
            ...
        ]
        `;

        const result = await callAI(DEFAULT_MODEL, prompt, {
            responseMimeType: "application/json"
        });

        const cleanedText = cleanJsonResponse(result.text || "[]");
        const json = JSON.parse(cleanedText);

        // De-duplicate pairs by term and match
        const seenTerms = new Set<string>();
        const seenMatches = new Set<string>();
        const uniquePairs = (json as { term?: string; match?: string }[]).filter(item => {
            const termKey = item.term?.toLowerCase()?.trim();
            const matchKey = item.match?.toLowerCase()?.trim();
            if (!termKey || !matchKey) return false;
            if (seenTerms.has(termKey) || seenMatches.has(matchKey)) return false;
            seenTerms.add(termKey);
            seenMatches.add(matchKey);
            return true;
        });

        return uniquePairs.map((item, index) => ({
            id: `pair-${index}`,
            // The filter above drops pairs missing either side.
            term: item.term ?? '',
            match: item.match ?? ''
        }));

    } catch (e) {
        console.error("AI Pair Gen Failed", e);
        // Fallback or rethrow
        return [];
    }
};

// --- Single Pair Regeneration ---
export const generateSingleTarsiaPairFromAI = async (
    course: CourseType,
    topic: string,
    gradeLevel: string,
    silliness: number = 0,
    existingPairs: TarsiaPair[],
    type: 'any' | 'math' | 'theory' = 'any'
): Promise<TarsiaPair | null> => {

    // Create exclude list
    const existingTerms = existingPairs.map(p => p.term).join(", ");

    let sillyInstructions = "";
    if (silliness > 0) {
        if (silliness <= 33) {
            sillyInstructions = `STYLE: Lighthearted. Add an emoji.`;
        } else if (silliness <= 66) {
            sillyInstructions = `STYLE: Fun & Punny. Make it a joke or pun. Use emojis.`;
        } else {
            sillyInstructions = `STYLE: MAXIMUM CHAOS. Make it hilarious,meme-worthy, and full of emojis.`;
        }
    }

    let typeInstructions = "";
    if (type === 'math') {
        typeInstructions = `
        STRICT REQUIREMENT: This MUST be a math/calculation problem.
        - "Term" = Problem statement (e.g. "Molality of...")
        - "Match" = Numerical Answer with Units
        `;
    } else if (type === 'theory') {
        typeInstructions = `
        STRICT REQUIREMENT: This MUST be a theoretical concept or definition.
        - NO calculation problems.
        `;
    }

    try {
        const prompt = `
        Generate exactly 1 NEW, UNIQUE "Term" and "Match" pair for a science review puzzle.
        Course: ${course}
        Grade Level: ${gradeLevel}
        Topic: ${topic}
        ${typeInstructions}
        ${sillyInstructions}
        
        CRITICAL RULES:
        - The new pair MUST be different from these existing terms: [${existingTerms}]
        - Pair must be short (1-4 words).
        - Return ONLY the JSON object.
        
        Format:
        {"term": "NewTerm", "match": "NewMatch"}
        `;

        const result = await callAI(DEFAULT_MODEL, prompt, {
            responseMimeType: "application/json"
        });

        const cleanedText = cleanJsonResponse(result.text || "{}");
        const json = JSON.parse(cleanedText);

        if (!json.term || !json.match) return null;

        return {
            id: `regen-${Date.now()}`,
            term: json.term,
            match: json.match
        };

    } catch (e) {
        console.error("AI Single Pair Gen Failed", e);
        return null;
    }
};
