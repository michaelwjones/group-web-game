import type {
    Clue,
    Pigment,
    BlindArtistsHiddenState,
    TargetPainting,
    Stroke,
    RevealedStroke,
    ZoneId
} from './types.js';
import { getColorDisplayName } from './color-mixer.js';
import { getZoneDisplayName } from './target-generator.js';

/**
 * Generate pigment hints for round 1.
 * These help players deduce pigments without revealing them directly.
 */
export function generatePigmentHints(
    playerPigments: Map<string, Pigment>,
    seatOrder: string[],
    playerNames: Record<string, string>
): Clue[] {
    const clues: Clue[] = [];
    const pigmentCounts = { red: 0, yellow: 0, blue: 0 };
    const playersList = Array.from(playerPigments.entries());

    // Count pigments
    for (const [, pigment] of playersList) {
        pigmentCounts[pigment]++;
    }

    // Generate 3-5 public clues about pigment distribution

    // Clue 1: Total count of one pigment type
    const randomPigment = (['red', 'yellow', 'blue'] as Pigment[])[Math.floor(Math.random() * 3)];
    clues.push({
        type: 'pigment_hint',
        text: `There are exactly ${pigmentCounts[randomPigment]} ${randomPigment} pigments among all players.`,
        round: 1,
        isPublic: true
    });

    // Clue 2: Adjacent pigment hint
    const adjacentHint = generateAdjacentHint(seatOrder, playerPigments, playerNames);
    if (adjacentHint) {
        clues.push({
            type: 'pigment_hint',
            text: adjacentHint,
            round: 1,
            isPublic: true
        });
    }

    // Clue 3: "NOT" hint about a specific player
    const randomIndex = Math.floor(Math.random() * playersList.length);
    const [playerId, actualPigment] = playersList[randomIndex];
    const notPigments = (['red', 'yellow', 'blue'] as Pigment[]).filter((p) => p !== actualPigment);
    const notPigment = notPigments[Math.floor(Math.random() * notPigments.length)];
    clues.push({
        type: 'pigment_hint',
        text: `${playerNames[playerId]} is definitely NOT ${notPigment}.`,
        round: 1,
        isPublic: true
    });

    // Clue 4: Sector/group hint
    const groupHint = generateGroupHint(seatOrder, playerPigments, playerNames);
    if (groupHint) {
        clues.push({
            type: 'pigment_hint',
            text: groupHint,
            round: 1,
            isPublic: true
        });
    }

    return clues;
}

/**
 * Generate a hint about adjacent players' pigments.
 */
function generateAdjacentHint(
    seatOrder: string[],
    playerPigments: Map<string, Pigment>,
    playerNames: Record<string, string>
): string | null {
    // Look for pairs with same or different pigments
    for (let i = 0; i < seatOrder.length; i++) {
        const current = seatOrder[i];
        const next = seatOrder[(i + 1) % seatOrder.length];
        const currentPigment = playerPigments.get(current);
        const nextPigment = playerPigments.get(next);

        if (currentPigment === nextPigment) {
            return `${playerNames[current]} and ${playerNames[next]} share the same pigment.`;
        }
    }

    // If no same pigments adjacent, pick a random pair and say they differ
    const i = Math.floor(Math.random() * seatOrder.length);
    const current = seatOrder[i];
    const next = seatOrder[(i + 1) % seatOrder.length];
    return `${playerNames[current]} and ${playerNames[next]} have different pigments.`;
}

/**
 * Generate a hint about a group of players.
 */
function generateGroupHint(
    seatOrder: string[],
    playerPigments: Map<string, Pigment>,
    playerNames: Record<string, string>
): string | null {
    // Split players into halves
    const halfLength = Math.ceil(seatOrder.length / 2);
    const firstHalf = seatOrder.slice(0, halfLength);

    // Count pigments in first half
    const counts = { red: 0, yellow: 0, blue: 0 };
    for (const playerId of firstHalf) {
        const pigment = playerPigments.get(playerId);
        if (pigment) counts[pigment]++;
    }

    // Find the most common pigment
    const maxPigment = (Object.entries(counts) as [Pigment, number][]).sort((a, b) => b[1] - a[1])[0];

    if (maxPigment[1] >= 2) {
        return `The first half of the seating (${playerNames[firstHalf[0]]} to ${playerNames[firstHalf[halfLength - 1]]}) contains at least ${maxPigment[1]} ${maxPigment[0]} pigments.`;
    }

    return null;
}

/**
 * Generate decision feedback clues for rounds 2+.
 * These provide information about how the previous round's strokes compared to the target.
 */
export function generateDecisionFeedback(
    state: BlindArtistsHiddenState,
    round: number,
    playerNames: Record<string, string>
): Clue[] {
    const clues: Clue[] = [];
    const { target, canvas, perfectStrokes } = state;

    // Analyze canvas state compared to target
    const zoneAnalysis = analyzeZones(target, canvas, perfectStrokes);

    // Generate thematic "client" feedback
    for (const [zoneId, analysis] of Object.entries(zoneAnalysis)) {
        const zoneName = getZoneDisplayName(parseInt(zoneId));

        if (analysis.extraStrokes > 0) {
            clues.push({
                type: 'decision_feedback',
                text: `The client frowns at ${zoneName}... "There's too much paint here."`,
                round,
                isPublic: true
            });
        } else if (analysis.missingStrokes > 0 && analysis.missingColors.length > 0) {
            // Hint about what's missing without being too specific
            const colorHint = getColorTemperatureHint(analysis.missingColors);
            clues.push({
                type: 'decision_feedback',
                text: `The client studies ${zoneName}... "${colorHint}"`,
                round,
                isPublic: true
            });
        } else if (analysis.wrongColors.length > 0) {
            const colorHint = getWrongColorHint(analysis.wrongColors);
            clues.push({
                type: 'decision_feedback',
                text: `The client tilts their head at ${zoneName}... "${colorHint}"`,
                round,
                isPublic: true
            });
        }
    }

    // Add a general progress hint
    const totalRequired = target.strokes.length;
    const perfectCount = perfectStrokes.length;
    if (perfectCount > 0) {
        clues.push({
            type: 'decision_feedback',
            text: `The client nods approvingly... "${perfectCount} of ${totalRequired} strokes are exactly what I envisioned."`,
            round,
            isPublic: true
        });
    }

    // If no strokes matched, give encouragement
    if (clues.length === 0) {
        clues.push({
            type: 'decision_feedback',
            text: `The client ponders... "Keep experimenting. The vision will come together."`,
            round,
            isPublic: true
        });
    }

    return clues;
}

interface ZoneAnalysis {
    extraStrokes: number;
    missingStrokes: number;
    missingColors: string[];
    wrongColors: string[];
    perfectCount: number;
}

/**
 * Analyze how the canvas compares to the target.
 */
function analyzeZones(
    target: TargetPainting,
    canvas: Map<ZoneId, Stroke[]>,
    perfectStrokes: RevealedStroke[]
): Record<number, ZoneAnalysis> {
    const analysis: Record<number, ZoneAnalysis> = {};

    // Initialize analysis for each zone
    for (let zoneId = 0; zoneId < target.zones; zoneId++) {
        const requiredStrokes = target.strokes.filter((s) => s.zoneId === zoneId);
        const actualStrokes = canvas.get(zoneId) ?? [];
        const perfectInZone = perfectStrokes.filter((s) => s.zoneId === zoneId);

        const requiredColors = requiredStrokes.map((s) => s.requiredColor);
        const actualColors = actualStrokes.map((s) => s.color);

        // Find missing and extra colors
        const missingColors: string[] = [];
        const remainingActual = [...actualColors];

        for (const color of requiredColors) {
            const idx = remainingActual.indexOf(color);
            if (idx >= 0) {
                remainingActual.splice(idx, 1);
            } else {
                missingColors.push(color);
            }
        }

        analysis[zoneId] = {
            extraStrokes: Math.max(0, actualStrokes.length - requiredStrokes.length),
            missingStrokes: requiredStrokes.length - perfectInZone.length,
            missingColors,
            wrongColors: remainingActual,
            perfectCount: perfectInZone.length
        };
    }

    return analysis;
}

/**
 * Get a thematic hint based on missing colors.
 */
function getColorTemperatureHint(missingColors: string[]): string {
    const hasWarm = missingColors.some((c) => ['red', 'orange', 'yellow'].includes(c));
    const hasCool = missingColors.some((c) => ['blue', 'green', 'purple'].includes(c));

    if (hasWarm && hasCool) {
        return "It needs more... complexity. Both warmth and coolness are lacking.";
    } else if (hasWarm) {
        return "It feels cold. Where is the warmth, the passion?";
    } else if (hasCool) {
        return "It's too warm. I need something cooler, more contemplative.";
    } else if (missingColors.includes('black')) {
        return "It lacks depth. I need darkness, the full spectrum.";
    }

    return "Something is missing here...";
}

/**
 * Get a thematic hint about wrong colors.
 */
function getWrongColorHint(wrongColors: string[]): string {
    if (wrongColors.length === 0) return "Interesting...";

    const hasWarm = wrongColors.some((c) => ['red', 'orange', 'yellow'].includes(c));
    const hasCool = wrongColors.some((c) => ['blue', 'green', 'purple'].includes(c));

    if (hasWarm && !hasCool) {
        return "Too much fire here. Perhaps a different approach?";
    } else if (hasCool && !hasWarm) {
        return "This feels too cold, too distant from my vision.";
    }

    return "The colors are fighting each other here...";
}

/**
 * Generate private clues for a specific player based on their actions.
 */
export function generatePrivateClue(
    playerId: string,
    state: BlindArtistsHiddenState,
    lastAction: { zone: ZoneId; resultColor: string } | null,
    round: number
): Clue | null {
    if (!lastAction) return null;

    const targetStrokesInZone = state.target.strokes.filter((s) => s.zoneId === lastAction.zone);
    const matchedTarget = targetStrokesInZone.find((s) => s.requiredColor === lastAction.resultColor);

    if (matchedTarget) {
        return {
            type: 'decision_feedback',
            text: `Your last stroke was exactly what the client wanted!`,
            round,
            isPublic: false
        };
    }

    // Give a subtle hint about what might be better
    if (targetStrokesInZone.length > 0) {
        const neededColors = targetStrokesInZone.map((s) => s.requiredColor);
        const hint = neededColors.some((c) => ['purple', 'green', 'orange'].includes(c))
            ? "The zone needs more blended colors..."
            : "Perhaps simpler strokes would work better here.";

        return {
            type: 'decision_feedback',
            text: hint,
            round,
            isPublic: false
        };
    }

    return null;
}
