import type { Pigment, StrokeColor } from './types.js';

/**
 * Mix pigments to produce a stroke color.
 *
 * Mixing rules:
 * - Single pigment: Red, Yellow, or Blue
 * - Two pigments: R+B=Purple, Y+B=Green, R+Y=Orange
 * - Three pigments: R+Y+B=Black
 */
export function mixPigments(pigments: Pigment[]): StrokeColor {
    // Get unique pigments
    const uniquePigments = new Set(pigments);

    const hasRed = uniquePigments.has('red');
    const hasYellow = uniquePigments.has('yellow');
    const hasBlue = uniquePigments.has('blue');

    const count = (hasRed ? 1 : 0) + (hasYellow ? 1 : 0) + (hasBlue ? 1 : 0);

    // Three pigments = black
    if (count === 3) {
        return 'black';
    }

    // Two pigments = secondary colors
    if (count === 2) {
        if (hasRed && hasBlue) return 'purple';
        if (hasYellow && hasBlue) return 'green';
        if (hasRed && hasYellow) return 'orange';
    }

    // Single pigment = primary color
    if (hasRed) return 'red';
    if (hasYellow) return 'yellow';
    if (hasBlue) return 'blue';

    // Fallback (should never happen with valid input)
    return 'black';
}

/**
 * Get the pigments needed to produce a given stroke color.
 * Returns all valid combinations (for target generation).
 */
export function getPigmentsForColor(color: StrokeColor): Pigment[][] {
    switch (color) {
        case 'red':
            return [['red']];
        case 'yellow':
            return [['yellow']];
        case 'blue':
            return [['blue']];
        case 'purple':
            return [['red', 'blue']];
        case 'green':
            return [['yellow', 'blue']];
        case 'orange':
            return [['red', 'yellow']];
        case 'black':
            return [['red', 'yellow', 'blue']];
        default:
            return [];
    }
}

/**
 * Check if a set of pigments can produce the target color.
 */
export function canProduceColor(pigments: Pigment[], targetColor: StrokeColor): boolean {
    return mixPigments(pigments) === targetColor;
}

/**
 * Get display name for a color.
 */
export function getColorDisplayName(color: StrokeColor): string {
    return color.charAt(0).toUpperCase() + color.slice(1);
}

/**
 * Get the number of unique pigments needed for a color.
 */
export function getPigmentCountForColor(color: StrokeColor): number {
    switch (color) {
        case 'red':
        case 'yellow':
        case 'blue':
            return 1;
        case 'purple':
        case 'green':
        case 'orange':
            return 2;
        case 'black':
            return 3;
        default:
            return 0;
    }
}
