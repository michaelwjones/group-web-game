import type { TargetPainting, TargetStroke, StrokeColor, Pigment, ZoneId } from './types.js';
import { getPigmentCountForColor } from './color-mixer.js';

// All possible stroke colors
const ALL_COLORS: StrokeColor[] = ['red', 'yellow', 'blue', 'purple', 'green', 'orange', 'black'];

// Primary colors (easier)
const PRIMARY_COLORS: StrokeColor[] = ['red', 'yellow', 'blue'];

// Secondary colors (medium difficulty)
const SECONDARY_COLORS: StrokeColor[] = ['purple', 'green', 'orange'];

/**
 * Calculate the number of zones based on player count.
 * Formula: playerCount / 4, rounded up
 */
export function calculateZoneCount(playerCount: number): number {
    return Math.ceil(playerCount / 4);
}

/**
 * Generate a target painting based on player count.
 */
export function generateTarget(playerCount: number): TargetPainting {
    const zones = calculateZoneCount(playerCount);

    // Calculate total strokes - roughly player count / 3 to make it achievable
    // Each player can contribute to one stroke per round, 5 rounds
    const totalStrokes = Math.min(zones * 2, Math.floor(playerCount / 2));

    const strokes: TargetStroke[] = [];

    // Distribute strokes across zones
    const strokesPerZone: number[] = new Array(zones).fill(0);

    // Ensure at least 1 stroke per zone, then distribute remaining
    for (let i = 0; i < Math.min(zones, totalStrokes); i++) {
        strokesPerZone[i] = 1;
    }

    // Distribute remaining strokes
    let remaining = totalStrokes - zones;
    let zoneIdx = 0;
    while (remaining > 0) {
        // Cap at 3 strokes per zone
        if (strokesPerZone[zoneIdx] < 3) {
            strokesPerZone[zoneIdx]++;
            remaining--;
        }
        zoneIdx = (zoneIdx + 1) % zones;
    }

    // Generate strokes for each zone with color variety
    for (let zoneId = 0; zoneId < zones; zoneId++) {
        const count = strokesPerZone[zoneId];

        for (let i = 0; i < count; i++) {
            // Mix of difficulty: prioritize variety
            const color = selectColorForZone(zoneId, i, strokes);
            strokes.push({ zoneId, requiredColor: color });
        }
    }

    return { zones, strokes };
}

/**
 * Select a color for a zone stroke, ensuring variety.
 */
function selectColorForZone(
    zoneId: ZoneId,
    strokeIndex: number,
    existingStrokes: TargetStroke[]
): StrokeColor {
    // Get colors already used in this zone
    const usedInZone = new Set(
        existingStrokes.filter((s) => s.zoneId === zoneId).map((s) => s.requiredColor)
    );

    // Get all colors used so far
    const usedOverall = new Set(existingStrokes.map((s) => s.requiredColor));

    // Prefer colors not yet used at all
    const unusedColors = ALL_COLORS.filter((c) => !usedOverall.has(c));
    if (unusedColors.length > 0) {
        return randomChoice(unusedColors);
    }

    // Then prefer colors not used in this zone
    const unusedInZone = ALL_COLORS.filter((c) => !usedInZone.has(c));
    if (unusedInZone.length > 0) {
        return randomChoice(unusedInZone);
    }

    // Otherwise pick any color
    return randomChoice(ALL_COLORS);
}

/**
 * Assign pigments to players, distributing roughly equally.
 */
export function assignPigments(playerIds: string[]): Map<string, Pigment> {
    const pigments: Map<string, Pigment> = new Map();
    const pigmentTypes: Pigment[] = ['red', 'yellow', 'blue'];

    // Shuffle players for random assignment
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5);

    // Distribute pigments as evenly as possible
    shuffled.forEach((playerId, index) => {
        pigments.set(playerId, pigmentTypes[index % 3]);
    });

    return pigments;
}

/**
 * Verify that a target is achievable with given pigment distribution.
 * Returns true if the pigment distribution can theoretically produce all required colors.
 */
export function isTargetAchievable(
    target: TargetPainting,
    pigments: Map<string, Pigment>
): boolean {
    // Count available pigments
    const pigmentCounts = { red: 0, yellow: 0, blue: 0 };
    for (const pigment of pigments.values()) {
        pigmentCounts[pigment]++;
    }

    // Check each stroke
    for (const stroke of target.strokes) {
        const neededCount = getPigmentCountForColor(stroke.requiredColor);

        // For primary colors, need at least 1 of that pigment
        if (neededCount === 1) {
            const pigment = stroke.requiredColor as Pigment;
            if (['red', 'yellow', 'blue'].includes(pigment) && pigmentCounts[pigment] < 1) {
                return false;
            }
        }

        // For secondary/tertiary colors, need multiple pigments available
        // This is a simplified check - real achievability depends on player selection constraints
    }

    return true;
}

/**
 * Get zone display name.
 */
export function getZoneDisplayName(zoneId: ZoneId): string {
    return `Zone ${zoneId + 1}`;
}

/**
 * Pick a random element from an array.
 */
function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array in place.
 */
export function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
