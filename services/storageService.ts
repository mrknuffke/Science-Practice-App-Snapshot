
import { Badge, SavedBadge, SessionSnapshot, SessionHistoryMetadata, ModeType, CourseType, Question, GradingReport, AppConfig, WhoAmIPuzzle } from '../types';

const STORAGE_KEY = 'science_partner_badges';
const STREAK_KEY = 'science_partner_streak';
const SESSION_HISTORY_KEY = 'science_partner_session_history';
const MAX_SESSIONS = 50;
const MAX_SIZE_KB = 5000; // ~5MB limit

export interface StreakInfo {
  count: number;
  lastDate: string; // ISO string
}

export const saveBadgeToStorage = (badge: Badge, topic: string, course: string, score: string): SavedBadge => {
  const existingData = localStorage.getItem(STORAGE_KEY);
  let badges: SavedBadge[] = existingData ? JSON.parse(existingData) : [];

  const newBadge: SavedBadge = {
    ...badge,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateEarned: new Date().toISOString(),
    topic,
    course,
    score,
    version: '2.0' // Marker for new badge system handling
  };

  // Add to beginning of array
  badges.unshift(newBadge);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
  return newBadge;
};

export const getBadgesFromStorage = (): SavedBadge[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const clearBadges = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STREAK_KEY);
};

export const calculateTotalXP = (badges: SavedBadge[]): number => {
  return badges.reduce((total, badge) => {
    if (!badge.score) return total; // Legacy/No score = 0 XP

    // Attempt to parse "8/10", "80%", or raw numbers
    // We only award XP for "X/Y" format where Y is max score, or direct matches.
    // For now, let's assume valid badges from the new system are "X/Y" strings.

    if (badge.score.includes('/')) {
      const portions = badge.score.split('/');
      const earned = parseFloat(portions[0]);
      // Safety check: if earned is a valid number, add it.
      if (!isNaN(earned)) return total + earned;
    }
    // If it's just a raw number string
    else if (!isNaN(parseFloat(badge.score))) {
      // Only count it if it's reasonable (e.g. <= 100). 
      // To be safe against "80%" -> 80 points vs "8/10", we might need more validation 
      // or just strictly support the "X/Y" format we generate now. 
      // For this iteration, let's stick to the X/Y format as the primary source of XP.
      return total;
    }

    return total;
  }, 0);
};

export const getStudentLevel = (xp: number): string => {
  if (xp < 50) return "Novice Observer";
  if (xp < 150) return "Lab Assistant";
  if (xp < 300) return "Junior Researcher";
  if (xp < 500) return "Senior Researcher";
  if (xp < 750) return "Lab Manager";
  if (xp < 1000) return "Principal Investigator";
  if (xp < 1500) return "Department Chair";
  if (xp < 2500) return "Nobel Laureate";
  return "Galactic Science Council";
};

/**
 * STREAK LOGIC
 */
export const getStreakInfo = (): StreakInfo => {
  const data = localStorage.getItem(STREAK_KEY);
  if (!data) return { count: 0, lastDate: '' };
  return JSON.parse(data);
};

export const updateStreak = (): number => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const info = getStreakInfo();

  if (!info.lastDate) {
    // First time ever
    const newInfo = { count: 1, lastDate: today };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newInfo));
    return 1;
  }

  const _lastDate = new Date(info.lastDate);
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();

  if (info.lastDate === today) {
    // Already updated today
    return info.count;
  } else if (info.lastDate === yesterday) {
    // Consecutive day!
    const newInfo = { count: info.count + 1, lastDate: today };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newInfo));
    return newInfo.count;
  } else {
    // Streak broken (more than 1 day gap)
    const newInfo = { count: 1, lastDate: today };
    localStorage.setItem(STREAK_KEY, JSON.stringify(newInfo));
    return 1;
  }
};

/**
 * SESSION HISTORY LOGIC
 */

/**
 * Save a completed session to history
 */
export const saveSessionToHistory = (
  mode: ModeType,
  course: CourseType,
  topics: string[],
  unit: string | null,
  questions: Question[],
  answers: Record<number, string>,
  report: GradingReport,
  config: AppConfig,
  duration?: number,
  badgeId?: string
): SessionSnapshot => {
  let sessions: SessionSnapshot[] = getSessionHistory();

  const newSession: SessionSnapshot = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    dateCompleted: new Date().toISOString(),
    mode,
    course,
    topics,
    unit,
    questions,
    answers,
    report,
    config,
    score: report.score,
    duration,
    badgeId
  };

  // Prepend new session
  sessions.unshift(newSession);

  // Enforce MAX_SESSIONS limit
  if (sessions.length > MAX_SESSIONS) {
    sessions = sessions.slice(0, MAX_SESSIONS);
  }

  // Size check and prune if needed
  let serialized = JSON.stringify(sessions);
  let sizeKB = new Blob([serialized]).size / 1024;

  while (sizeKB > MAX_SIZE_KB && sessions.length > 10) {
    sessions.pop();
    serialized = JSON.stringify(sessions);
    sizeKB = new Blob([serialized]).size / 1024;
  }

  localStorage.setItem(SESSION_HISTORY_KEY, serialized);
  return newSession;
};

/**
 * Get all sessions from history
 */
export const getSessionHistory = (): SessionSnapshot[] => {
  const data = localStorage.getItem(SESSION_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Get a single session by ID
 */
export const getSessionById = (id: string): SessionSnapshot | null => {
  const sessions = getSessionHistory();
  return sessions.find(s => s.id === id) || null;
};

/**
 * Delete a session by ID
 */
export const deleteSession = (id: string): void => {
  const sessions = getSessionHistory();
  const filtered = sessions.filter(s => s.id !== id);
  localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(filtered));
};

/**
 * Clear all session history
 */
export const clearSessionHistory = (): void => {
  localStorage.removeItem(SESSION_HISTORY_KEY);
};

/**
 * Get storage metadata
 */
export const getSessionHistoryMetadata = (): SessionHistoryMetadata => {
  const sessions = getSessionHistory();
  const serialized = JSON.stringify(sessions);
  const sizeKB = new Blob([serialized]).size / 1024;

  return {
    totalSessions: sessions.length,
    oldestSessionDate: sessions.length > 0 ? sessions[sessions.length - 1].dateCompleted : '',
    sizeEstimateKB: Math.round(sizeKB)
  };
};

// ==================== Who Am I Game Storage ====================

const WHO_AM_I_GAMES_KEY = 'science_partner_who_am_i_games';

export interface SavedWhoAmIGame {
  id: string;
  name: string;
  course: CourseType;
  topic: string;
  puzzles: WhoAmIPuzzle[];
  dateCreated: string;
  dateModified: string;
}

/**
 * Save a Who Am I game to localStorage
 */
export const saveWhoAmIGame = (
  name: string,
  course: CourseType,
  topic: string,
  puzzles: WhoAmIPuzzle[]
): SavedWhoAmIGame => {
  const games = getSavedWhoAmIGames();

  const newGame: SavedWhoAmIGame = {
    id: `whoami-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    course,
    topic,
    puzzles,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };

  games.unshift(newGame);
  localStorage.setItem(WHO_AM_I_GAMES_KEY, JSON.stringify(games));

  return newGame;
};

/**
 * Get all saved Who Am I games
 */
export const getSavedWhoAmIGames = (): SavedWhoAmIGame[] => {
  const data = localStorage.getItem(WHO_AM_I_GAMES_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * Load a specific Who Am I game by ID
 */
export const loadWhoAmIGame = (id: string): SavedWhoAmIGame | null => {
  const games = getSavedWhoAmIGames();
  return games.find(g => g.id === id) || null;
};

/**
 * Update an existing Who Am I game
 */
export const updateWhoAmIGame = (
  id: string,
  updates: Partial<Pick<SavedWhoAmIGame, 'name' | 'puzzles'>>
): SavedWhoAmIGame | null => {
  const games = getSavedWhoAmIGames();
  const index = games.findIndex(g => g.id === id);

  if (index === -1) return null;

  games[index] = {
    ...games[index],
    ...updates,
    dateModified: new Date().toISOString()
  };

  localStorage.setItem(WHO_AM_I_GAMES_KEY, JSON.stringify(games));
  return games[index];
};

/**
 * Delete a Who Am I game by ID
 */
export const deleteWhoAmIGame = (id: string): void => {
  const games = getSavedWhoAmIGames();
  const filtered = games.filter(g => g.id !== id);
  localStorage.setItem(WHO_AM_I_GAMES_KEY, JSON.stringify(filtered));
};

/**
 * Generate shareable JSON string for a Who Am I game
 */
export const exportWhoAmIGame = (game: SavedWhoAmIGame): string => {
  return JSON.stringify(game, null, 2);
};

/**
 * Import a Who Am I game from JSON string
 */
export const importWhoAmIGame = (jsonString: string): SavedWhoAmIGame | null => {
  try {
    const game = JSON.parse(jsonString);
    // Validate structure
    if (!game.puzzles || !Array.isArray(game.puzzles)) {
      throw new Error('Invalid game structure');
    }

    // Save with new ID and dates
    return saveWhoAmIGame(
      game.name || 'Imported Game',
      game.course || 'Custom Practice',
      game.topic || 'Custom Topic',
      game.puzzles
    );
  } catch (error) {
    console.error('Failed to import Who Am I game:', error);
    return null;
  }
};
