
export interface Team {
    id: number;
    name: string;
    score: number;
}

export interface ChartPoint {
    label: string;
    value?: number;
    value2?: number;
    valueBefore?: number;
    valueAfter?: number;
    error?: number;
}

export interface TableData {
    headers: string[];
    rows: string[][];
}

export interface JeopardyQuestion {
    id: string;
    value: number;
    question: string;
    answer: string;
    hint: string;
    answered?: boolean;
    scoringHistory?: Record<number, number>; // teamId -> scoreDelta
    chartData?: ChartPoint[];
    tableData?: TableData;
    xAxisLabel?: string;
    yAxisLabel?: string;
    chartType?: 'line' | 'area' | 'bar' | 'scatter';
}

export interface JeopardyCategory {
    title: string;
    questions: JeopardyQuestion[];
}

export interface FinalJeopardy {
    category: string;
    clue: string;
    answer: string;
}

export interface JeopardyBoardData {
    categories: JeopardyCategory[];
    finalJeopardy?: FinalJeopardy;
    dailyDoubleIds: string[]; // Question IDs designated as Daily Doubles
}

export interface SavedBoard {
    id: string;
    name: string;
    topic: string;
    gradeLevel: string;
    board: JeopardyBoardData; // Saves the pristine initial state
    timestamp: number;
    signature: string; // Used to identify unique board content
    isWholeCourse?: boolean; // True if this board is a clever whole-course review
}

export interface Message {
    role: 'user' | 'model';
    text: string;
}

export interface PracticeProblem {
    topic: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}
