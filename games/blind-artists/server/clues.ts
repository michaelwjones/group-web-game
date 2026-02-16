import type { Pigment } from './types.js';

type ClueType = 'neighbor' | 'distance' | 'exclusion' | 'color-potential' | 'presence';

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Get neighbors of a player in circular seating
 */
function getNeighbors(playerId: string, seatingOrder: string[]): string[] {
    const idx = seatingOrder.indexOf(playerId);
    if (idx === -1) return [];
    const left = seatingOrder[(idx - 1 + seatingOrder.length) % seatingOrder.length];
    const right = seatingOrder[(idx + 1) % seatingOrder.length];
    return [left, right];
}

/**
 * Get players within N seats of a player
 */
function getPlayersWithinDistance(playerId: string, seatingOrder: string[], distance: number): string[] {
    const idx = seatingOrder.indexOf(playerId);
    if (idx === -1) return [];

    const nearby: string[] = [];
    for (let d = 1; d <= distance; d++) {
        nearby.push(seatingOrder[(idx - d + seatingOrder.length) % seatingOrder.length]);
        nearby.push(seatingOrder[(idx + d) % seatingOrder.length]);
    }
    return [...new Set(nearby)]; // remove duplicates for small circles
}

/**
 * Get the pigments that can make a secondary color
 */
function getSecondaryComponents(secondary: 'orange' | 'green' | 'purple'): [Pigment, Pigment] {
    switch (secondary) {
        case 'orange': return ['red', 'yellow'];
        case 'green': return ['yellow', 'blue'];
        case 'purple': return ['red', 'blue'];
    }
}

/**
 * Check if a group of players can make a secondary color
 */
function canMakeSecondary(
    playerIds: string[],
    pigments: Record<string, Pigment>,
    secondary: 'orange' | 'green' | 'purple'
): boolean {
    const [c1, c2] = getSecondaryComponents(secondary);
    const hasPigments = playerIds.map(id => pigments[id]);
    return hasPigments.includes(c1) && hasPigments.includes(c2);
}

/**
 * Generate a neighbor clue for a player
 */
function generateNeighborClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string | null {
    const neighbors = getNeighbors(playerId, seatingOrder);
    if (neighbors.length === 0) return null;

    const neighborPigments = neighbors.map(id => pigments[id]);
    const pigmentOptions: Pigment[] = ['red', 'yellow', 'blue'];

    // Try positive clue: "One of your neighbors is [color]"
    for (const pigment of shuffle(pigmentOptions)) {
        if (neighborPigments.includes(pigment)) {
            return `At least one of your neighbors is ${capitalize(pigment)}`;
        }
    }

    // Try negative clue: "Neither of your neighbors is [color]"
    for (const pigment of shuffle(pigmentOptions)) {
        if (!neighborPigments.includes(pigment)) {
            return `Neither of your neighbors is ${capitalize(pigment)}`;
        }
    }

    return null;
}

/**
 * Generate a distance clue for a player
 */
function generateDistanceClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string | null {
    const nearby = getPlayersWithinDistance(playerId, seatingOrder, 2);
    if (nearby.length === 0) return null;

    const nearbyPigments = nearby.map(id => pigments[id]);
    const pigmentOptions: Pigment[] = ['red', 'yellow', 'blue'];

    // Try positive clue
    for (const pigment of shuffle(pigmentOptions)) {
        if (nearbyPigments.includes(pigment)) {
            return `At least one person within 2 seats of you is ${capitalize(pigment)}`;
        }
    }

    // Try negative clue
    for (const pigment of shuffle(pigmentOptions)) {
        if (!nearbyPigments.includes(pigment)) {
            return `No one within 2 seats of you is ${capitalize(pigment)}`;
        }
    }

    return null;
}

/**
 * Generate an exclusion clue: "[Player] is not [color]"
 */
function generateExclusionClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string | null {
    // Pick a random other player
    const otherPlayers = seatingOrder.filter(id => id !== playerId);
    if (otherPlayers.length === 0) return null;

    const target = randomChoice(otherPlayers);
    const targetPigment = pigments[target];
    const otherPigments: Pigment[] = (['red', 'yellow', 'blue'] as Pigment[]).filter(p => p !== targetPigment);

    if (otherPigments.length === 0) return null;

    const wrongPigment = randomChoice(otherPigments);
    return `${playerNames[target]} is not ${capitalize(wrongPigment)}`;
}

/**
 * Generate a color-potential clue about 3 players
 */
function generateColorPotentialClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string | null {
    const allPlayers = [...seatingOrder];
    if (allPlayers.length < 3) return null;

    // Pick 3 random players
    const shuffled = shuffle(allPlayers);
    const group = shuffled.slice(0, 3);
    const names = group.map(id => playerNames[id]).join(', ');

    const secondaries: ('orange' | 'green' | 'purple')[] = ['orange', 'green', 'purple'];

    // Try positive clue
    for (const secondary of shuffle(secondaries)) {
        if (canMakeSecondary(group, pigments, secondary)) {
            return `${names} can make ${capitalize(secondary)}`;
        }
    }

    // Try negative clue
    for (const secondary of shuffle(secondaries)) {
        if (!canMakeSecondary(group, pigments, secondary)) {
            return `${names} cannot make ${capitalize(secondary)}`;
        }
    }

    return null;
}

/**
 * Generate a presence clue about 3-4 players
 */
function generatePresenceClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string | null {
    const allPlayers = [...seatingOrder];
    if (allPlayers.length < 3) return null;

    const pigmentOptions: Pigment[] = ['red', 'yellow', 'blue'];

    // Try "at least one of X, Y, Z is [color]" (3 players)
    const shuffled3 = shuffle(allPlayers).slice(0, 3);
    const groupPigments3 = shuffled3.map(id => pigments[id]);
    const names3 = shuffled3.map(id => playerNames[id]).join(', ');

    for (const pigment of shuffle(pigmentOptions)) {
        if (groupPigments3.includes(pigment)) {
            return `At least one of ${names3} is ${capitalize(pigment)}`;
        }
    }

    // Try "among W, X, Y, Z, at least two are [color]" (4 players)
    if (allPlayers.length >= 4) {
        const shuffled4 = shuffle(allPlayers).slice(0, 4);
        const groupPigments4 = shuffled4.map(id => pigments[id]);
        const names4 = shuffled4.map(id => playerNames[id]).join(', ');

        for (const pigment of shuffle(pigmentOptions)) {
            const count = groupPigments4.filter(p => p === pigment).length;
            if (count >= 2) {
                return `Among ${names4}, at least two are ${capitalize(pigment)}`;
            }
        }
    }

    return null;
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Generate a clue for a player
 * Tries different clue types until one works
 */
export function generateClue(
    playerId: string,
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): string {
    const clueGenerators = shuffle([
        () => generateNeighborClue(playerId, pigments, seatingOrder, playerNames),
        () => generateDistanceClue(playerId, pigments, seatingOrder, playerNames),
        () => generateExclusionClue(playerId, pigments, seatingOrder, playerNames),
        () => generateColorPotentialClue(playerId, pigments, seatingOrder, playerNames),
        () => generatePresenceClue(playerId, pigments, seatingOrder, playerNames)
    ]);

    for (const generator of clueGenerators) {
        const clue = generator();
        if (clue) return clue;
    }

    // Fallback: simple exclusion about self
    const selfPigment = pigments[playerId];
    const otherPigments = (['red', 'yellow', 'blue'] as Pigment[]).filter(p => p !== selfPigment);
    return `You are not ${capitalize(randomChoice(otherPigments))}`;
}

/**
 * Generate clues for all players
 */
export function generateAllClues(
    playerIds: string[],
    pigments: Record<string, Pigment>,
    seatingOrder: string[],
    playerNames: Record<string, string>
): Record<string, string> {
    const clues: Record<string, string> = {};
    for (const playerId of playerIds) {
        clues[playerId] = generateClue(playerId, pigments, seatingOrder, playerNames);
    }
    return clues;
}
