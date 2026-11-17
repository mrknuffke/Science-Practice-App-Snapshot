/**
 * Utility functions for calculating adaptive font sizes in square match puzzles
 * Font size scales based on text length, grid size (3x3, 4x4, 5x5), and vertical/horizontal orientation
 */

/**
 * Get adaptive font size for puzzle squares
 * @param text - The text to display
 * @param isVertical - Whether text orientation is vertical
 * @param gridSize - Grid size (3, 4, or 5)
 * @returns Tailwind font size class
 */
export const getAdaptiveFontSize = (text: string | null | undefined, isVertical: boolean = false, gridSize: number = 5): string => {
    if (!text) return 'text-[10px]';
    const len = text.length;

    // Base sizes vary by grid: 3x3 = larger, 4x4 = medium, 5x5 = smaller
    if (gridSize === 3) {
        // 3x3: Larger squares, can use bigger fonts
        if (isVertical) {
            if (len > 30) return 'text-[8px]';
            if (len > 24) return 'text-[9px]';
            if (len > 18) return 'text-[10px]';
            if (len > 12) return 'text-[11px]';
            return 'text-[12px]';
        } else {
            if (len > 30) return 'text-[9px]';
            if (len > 24) return 'text-[10px]';
            if (len > 18) return 'text-[11px]';
            if (len > 12) return 'text-[12px]';
            return 'text-[14px]';
        }
    } else if (gridSize === 4) {
        // 4x4: Medium squares
        if (isVertical) {
            if (len > 30) return 'text-[6px]';
            if (len > 24) return 'text-[7px]';
            if (len > 18) return 'text-[8px]';
            if (len > 12) return 'text-[9px]';
            return 'text-[10px]';
        } else {
            if (len > 30) return 'text-[7px]';
            if (len > 24) return 'text-[8px]';
            if (len > 18) return 'text-[9px]';
            if (len > 12) return 'text-[10px]';
            return 'text-[11px]';
        }
    } else {
        // 5x5: Smallest squares, need smallest fonts
        if (isVertical) {
            if (len > 30) return 'text-[5px]';
            if (len > 24) return 'text-[6px]';
            if (len > 18) return 'text-[7px]';
            if (len > 12) return 'text-[8px]';
            return 'text-[9px]';
        } else {
            if (len > 30) return 'text-[6px]';
            if (len > 24) return 'text-[7px]';
            if (len > 18) return 'text-[8px]';
            if (len > 12) return 'text-[9px]';
            return 'text-[10px]';
        }
    }
};

/**
 * Get adaptive font size for answer key squares (smaller than main puzzle)
 * @param text - The text to display
 * @param isVertical - Whether text orientation is vertical
 * @param gridSize - Grid size (3, 4, or 5)
 * @returns Tailwind font size class
 */
export const getAdaptiveKeySizeFont = (text: string | null | undefined, isVertical: boolean = false, gridSize: number = 5): string => {
    if (!text) return 'text-[7px]';
    const len = text.length;

    if (gridSize === 3) {
        // 3x3: Larger key squares
        if (isVertical) {
            if (len > 30) return 'text-[6px]';
            if (len > 24) return 'text-[7px]';
            if (len > 18) return 'text-[8px]';
            if (len > 12) return 'text-[9px]';
            return 'text-[10px]';
        } else {
            if (len > 30) return 'text-[7px]';
            if (len > 24) return 'text-[8px]';
            if (len > 18) return 'text-[9px]';
            if (len > 12) return 'text-[10px]';
            return 'text-[11px]';
        }
    } else if (gridSize === 4) {
        // 4x4: Medium key squares
        if (isVertical) {
            if (len > 30) return 'text-[5px]';
            if (len > 24) return 'text-[6px]';
            if (len > 18) return 'text-[6px]';
            if (len > 12) return 'text-[7px]';
            return 'text-[8px]';
        } else {
            if (len > 30) return 'text-[6px]';
            if (len > 24) return 'text-[6px]';
            if (len > 18) return 'text-[7px]';
            if (len > 12) return 'text-[7px]';
            return 'text-[8px]';
        }
    } else {
        // 5x5: Smallest key squares
        if (isVertical) {
            if (len > 30) return 'text-[4px]';
            if (len > 24) return 'text-[5px]';
            if (len > 18) return 'text-[5px]';
            if (len > 12) return 'text-[6px]';
            return 'text-[7px]';
        } else {
            if (len > 30) return 'text-[5px]';
            if (len > 24) return 'text-[5px]';
            if (len > 18) return 'text-[6px]';
            if (len > 12) return 'text-[6px]';
            return 'text-[7px]';
        }
    }
};
