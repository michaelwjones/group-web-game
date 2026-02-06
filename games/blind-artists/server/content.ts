import type { Zone, SlotType, Color, Pigment } from './types.js';
import { ZONES, SLOT_TYPES, COLORS, COLOR_TO_PIGMENTS, createEmptySlotRecord } from './types.js';

// Element definitions with valid Primary/Secondary colors
interface ElementDef {
    name: string;
    primary: Color[];
    secondary: Color[];
}

const ELEMENTS: Record<Zone, ElementDef[]> = {
    back: [
        { name: 'Aurora', primary: ['green', 'purple'], secondary: ['green', 'purple', 'blue', 'yellow'] },
        { name: 'Sunset', primary: ['orange', 'red'], secondary: ['orange', 'red', 'purple', 'yellow'] },
        { name: 'Storm Front', primary: ['purple', 'blue'], secondary: ['purple', 'blue', 'green', 'yellow'] }
    ],
    mid: [
        { name: 'Mountains', primary: ['purple', 'blue'], secondary: ['purple', 'blue', 'orange', 'green'] },
        { name: 'Forest', primary: ['green', 'orange'], secondary: ['green', 'orange', 'yellow', 'red'] },
        { name: 'Lake', primary: ['blue', 'green'], secondary: ['blue', 'green', 'purple', 'yellow'] }
    ],
    fore: [
        { name: 'Meadow', primary: ['green', 'yellow'], secondary: ['green', 'yellow', 'orange', 'purple'] },
        { name: 'Rocky Shore', primary: ['blue', 'orange'], secondary: ['blue', 'orange', 'purple', 'yellow'] },
        { name: 'Snow Field', primary: ['blue', 'purple'], secondary: ['blue', 'purple', 'yellow', 'green'] }
    ],
    focus: [
        { name: 'Lone Tree', primary: ['green', 'orange'], secondary: ['green', 'orange', 'red', 'yellow', 'purple'] },
        { name: 'Windmill', primary: ['orange', 'red'], secondary: ['orange', 'red', 'yellow', 'purple', 'blue'] },
        { name: 'Campfire', primary: ['orange', 'yellow'], secondary: ['orange', 'yellow', 'red'] }
    ]
};

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

export interface GeneratedTarget {
    target: Record<Zone, Record<SlotType, Color>>;
    elements: Record<Zone, string>;
}

/**
 * Generate a random target painting
 * For each zone: pick random element, pick valid primary/secondary colors, pick random highlight/shadow
 */
export function generateTarget(): GeneratedTarget {
    const target = createEmptySlotRecord<Color>('red'); // will be overwritten
    const elements: Record<Zone, string> = { back: '', mid: '', fore: '', focus: '' };

    for (const zone of ZONES) {
        const element = randomChoice(ELEMENTS[zone]);
        elements[zone] = element.name;

        target[zone].primary = randomChoice(element.primary);
        target[zone].secondary = randomChoice(element.secondary);
        target[zone].highlight = randomChoice(COLORS);
        target[zone].shadow = randomChoice(COLORS);
    }

    return { target, elements };
}

/**
 * Calculate how many times each pigment is needed to paint the target
 */
export function calculatePigmentDemand(target: Record<Zone, Record<SlotType, Color>>): Record<Pigment, number> {
    const demand: Record<Pigment, number> = { red: 0, yellow: 0, blue: 0 };

    for (const zone of ZONES) {
        for (const slot of SLOT_TYPES) {
            const color = target[zone][slot];
            const pigments = COLOR_TO_PIGMENTS[color];
            for (const pigment of pigments) {
                demand[pigment]++;
            }
        }
    }

    return demand;
}

/**
 * Distribute pigments to players, skewing toward higher-demand pigments
 * Each player gets exactly one pigment
 */
export function distributePigments(
    playerIds: string[],
    demand: Record<Pigment, number>
): Record<string, Pigment> {
    const assignments: Record<string, Pigment> = {};
    const playerCount = playerIds.length;

    // Calculate ideal distribution based on demand ratios
    const totalDemand = demand.red + demand.yellow + demand.blue;
    const idealCounts: Record<Pigment, number> = {
        red: Math.round((demand.red / totalDemand) * playerCount),
        yellow: Math.round((demand.yellow / totalDemand) * playerCount),
        blue: Math.round((demand.blue / totalDemand) * playerCount)
    };

    // Adjust to ensure we have exactly playerCount assignments
    let total = idealCounts.red + idealCounts.yellow + idealCounts.blue;
    while (total !== playerCount) {
        if (total < playerCount) {
            // Add to highest demand pigment
            const sorted = (['red', 'yellow', 'blue'] as Pigment[]).sort((a, b) => demand[b] - demand[a]);
            idealCounts[sorted[0]]++;
            total++;
        } else {
            // Remove from lowest demand pigment (but keep at least 1)
            const sorted = (['red', 'yellow', 'blue'] as Pigment[]).sort((a, b) => demand[a] - demand[b]);
            for (const p of sorted) {
                if (idealCounts[p] > 1) {
                    idealCounts[p]--;
                    total--;
                    break;
                }
            }
        }
    }

    // Create pool of pigments to assign
    const pigmentPool: Pigment[] = [];
    for (const pigment of ['red', 'yellow', 'blue'] as Pigment[]) {
        for (let i = 0; i < idealCounts[pigment]; i++) {
            pigmentPool.push(pigment);
        }
    }

    // Shuffle and assign
    const shuffledPool = shuffle(pigmentPool);
    const shuffledPlayers = shuffle(playerIds);
    for (let i = 0; i < playerCount; i++) {
        assignments[shuffledPlayers[i]] = shuffledPool[i];
    }

    return assignments;
}

/**
 * Validate that pigment distribution has at least 2x supply for each demand
 * Each player has 5 uses, so supply = count * 5
 */
export function validatePigmentDistribution(
    assignments: Record<string, Pigment>,
    demand: Record<Pigment, number>
): boolean {
    const supply: Record<Pigment, number> = { red: 0, yellow: 0, blue: 0 };

    for (const pigment of Object.values(assignments)) {
        supply[pigment] += 5; // each player has 5 uses
    }

    for (const pigment of ['red', 'yellow', 'blue'] as Pigment[]) {
        if (demand[pigment] > 0 && supply[pigment] < demand[pigment] * 2) {
            return false;
        }
    }

    return true;
}

/**
 * Generate a complete valid target with pigment assignments
 * Retries until validation passes
 */
export function generateValidGame(playerIds: string[], maxRetries = 100): {
    target: Record<Zone, Record<SlotType, Color>>;
    elements: Record<Zone, string>;
    pigments: Record<string, Pigment>;
} {
    for (let i = 0; i < maxRetries; i++) {
        const { target, elements } = generateTarget();
        const demand = calculatePigmentDemand(target);
        const pigments = distributePigments(playerIds, demand);

        if (validatePigmentDistribution(pigments, demand)) {
            return { target, elements, pigments };
        }
    }

    throw new Error('Failed to generate valid game after max retries');
}

/**
 * Get all elements for a zone
 */
export function getZoneElements(zone: Zone): string[] {
    return ELEMENTS[zone].map(e => e.name);
}

/**
 * Get all zone names
 */
export function getAllElements(): Record<Zone, string[]> {
    return {
        back: getZoneElements('back'),
        mid: getZoneElements('mid'),
        fore: getZoneElements('fore'),
        focus: getZoneElements('focus')
    };
}
