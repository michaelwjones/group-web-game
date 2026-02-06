import type { Zone, SlotType, Color } from './types.js';
import { ZONES, SLOT_TYPES } from './types.js';

type Canvas = Record<Zone, Record<SlotType, Color | null>>;
type Target = Record<Zone, Record<SlotType, Color>>;

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

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Count errors in a zone
 */
function countZoneErrors(zone: Zone, canvas: Canvas, target: Target): number {
    let errors = 0;
    for (const slot of SLOT_TYPES) {
        const canvasColor = canvas[zone][slot];
        const targetColor = target[zone][slot];
        if (canvasColor !== targetColor) {
            errors++;
        }
    }
    return errors;
}

/**
 * Count errors for a slot type across all zones
 */
function countSlotTypeErrors(slotType: SlotType, canvas: Canvas, target: Target): number {
    let errors = 0;
    for (const zone of ZONES) {
        const canvasColor = canvas[zone][slotType];
        const targetColor = target[zone][slotType];
        if (canvasColor !== targetColor) {
            errors++;
        }
    }
    return errors;
}

/**
 * Get all incorrect slots
 */
function getIncorrectSlots(canvas: Canvas, target: Target): { zone: Zone; slot: SlotType }[] {
    const incorrect: { zone: Zone; slot: SlotType }[] = [];
    for (const zone of ZONES) {
        for (const slot of SLOT_TYPES) {
            if (canvas[zone][slot] !== target[zone][slot]) {
                incorrect.push({ zone, slot });
            }
        }
    }
    return incorrect;
}

/**
 * Get all correct slots
 */
function getCorrectSlots(canvas: Canvas, target: Target): { zone: Zone; slot: SlotType }[] {
    const correct: { zone: Zone; slot: SlotType }[] = [];
    for (const zone of ZONES) {
        for (const slot of SLOT_TYPES) {
            if (canvas[zone][slot] === target[zone][slot]) {
                correct.push({ zone, slot });
            }
        }
    }
    return correct;
}

/**
 * Locate: Find the zone or slot type with the most errors
 */
export function locate(
    scope: 'zones' | 'slots',
    canvas: Canvas,
    target: Target
): string {
    if (scope === 'zones') {
        const errors = ZONES.map(zone => ({ zone, count: countZoneErrors(zone, canvas, target) }));
        const maxErrors = Math.max(...errors.map(e => e.count));

        if (maxErrors === 0) {
            return 'Everything looks perfect!';
        }

        const worst = errors.filter(e => e.count === maxErrors);
        const chosen = randomChoice(worst);
        return capitalize(chosen.zone);
    } else {
        const errors = SLOT_TYPES.map(slot => ({ slot, count: countSlotTypeErrors(slot, canvas, target) }));
        const maxErrors = Math.max(...errors.map(e => e.count));

        if (maxErrors === 0) {
            return 'Everything looks perfect!';
        }

        const worst = errors.filter(e => e.count === maxErrors);
        const chosen = randomChoice(worst);
        return capitalize(chosen.slot) + ' slots';
    }
}

/**
 * Diagnose: List which positions are incorrect within a scope
 */
export function diagnose(
    scope: Zone | SlotType,
    canvas: Canvas,
    target: Target
): string {
    const isZone = ZONES.includes(scope as Zone);

    if (isZone) {
        const zone = scope as Zone;
        const incorrect: SlotType[] = [];
        for (const slot of SLOT_TYPES) {
            if (canvas[zone][slot] !== target[zone][slot]) {
                incorrect.push(slot);
            }
        }

        if (incorrect.length === 0) {
            return `The ${capitalize(zone)} is perfect!`;
        }

        return incorrect.map(s => capitalize(s)).join(', ');
    } else {
        const slotType = scope as SlotType;
        const incorrect: Zone[] = [];
        for (const zone of ZONES) {
            if (canvas[zone][slotType] !== target[zone][slotType]) {
                incorrect.push(zone);
            }
        }

        if (incorrect.length === 0) {
            return `All ${capitalize(slotType)} slots are correct!`;
        }

        return incorrect.map(z => capitalize(z)).join(', ');
    }
}

/**
 * Prescribe: Recommend a color + partial location
 */
export function prescribe(canvas: Canvas, target: Target): string {
    const incorrect = getIncorrectSlots(canvas, target);

    if (incorrect.length === 0) {
        return 'The painting is perfect!';
    }

    // Pick a random incorrect slot
    const chosen = randomChoice(incorrect);
    const neededColor = target[chosen.zone][chosen.slot];

    // Randomly choose to give zone or slot type
    if (Math.random() < 0.5) {
        return `${capitalize(neededColor)} in ${capitalize(chosen.zone)}`;
    } else {
        return `${capitalize(neededColor)} as a ${capitalize(chosen.slot)}`;
    }
}

/**
 * Validate: Check if a specific slot is correct
 */
export function validate(
    zone: Zone,
    slot: SlotType,
    canvas: Canvas,
    target: Target
): string {
    const canvasColor = canvas[zone][slot];
    const targetColor = target[zone][slot];

    if (canvasColor === targetColor) {
        return 'Yes';
    } else {
        return 'No';
    }
}

/**
 * Generate freebie feedback
 * Prioritizes defensive (protecting correct work) then offensive (directing to problems)
 */
export function generateFreebie(
    canvas: Canvas,
    target: Target,
    alreadyGiven: string[]
): string {
    const correct = getCorrectSlots(canvas, target);
    const incorrect = getIncorrectSlots(canvas, target);

    const defensivePhrases: string[] = [];
    const offensivePhrases: string[] = [];

    // Generate defensive phrases for correct zones
    for (const zone of ZONES) {
        const zoneErrors = countZoneErrors(zone, canvas, target);
        if (zoneErrors === 0) {
            defensivePhrases.push(`The ${capitalize(zone)} is perfect!`);
        } else if (zoneErrors === 1) {
            defensivePhrases.push(`The ${capitalize(zone)} is almost there`);
        }
    }

    // Generate defensive phrases for correct slots
    for (const slot of correct) {
        defensivePhrases.push(`I love the ${capitalize(slot.slot)} in the ${capitalize(slot.zone)}`);
    }

    // Generate offensive phrases for problem areas
    for (const zone of ZONES) {
        const zoneErrors = countZoneErrors(zone, canvas, target);
        if (zoneErrors === 4) {
            offensivePhrases.push(`Nothing is right about the ${capitalize(zone)}`);
        } else if (zoneErrors >= 3) {
            offensivePhrases.push(`The ${capitalize(zone)} needs serious work`);
        }
    }

    // Check slot types
    for (const slotType of SLOT_TYPES) {
        const errors = countSlotTypeErrors(slotType, canvas, target);
        if (errors === 4) {
            offensivePhrases.push(`All the ${capitalize(slotType)} slots are wrong`);
        } else if (errors >= 3) {
            offensivePhrases.push(`The ${capitalize(slotType)} slots need work`);
        }
    }

    // Filter out already given feedback
    const availableDefensive = defensivePhrases.filter(p => !alreadyGiven.includes(p));
    const availableOffensive = offensivePhrases.filter(p => !alreadyGiven.includes(p));

    // Prioritize defensive, then offensive
    if (availableDefensive.length > 0) {
        return randomChoice(availableDefensive);
    }

    if (availableOffensive.length > 0) {
        return randomChoice(availableOffensive);
    }

    // Fallback: generate a generic hint
    if (incorrect.length > 0) {
        const slot = randomChoice(incorrect);
        return `Keep working on the ${capitalize(slot.zone)}`;
    }

    return 'The painting is coming together nicely';
}

/**
 * Generate unique freebies for multiple liaisons
 */
export function generateFreebiesForLiaisons(
    liaisonIds: string[],
    canvas: Canvas,
    target: Target,
    previousFreebies: Record<string, string[]>
): Record<string, string> {
    const result: Record<string, string> = {};
    const usedThisRound: string[] = [];

    for (const liaisonId of liaisonIds) {
        const alreadyGiven = [
            ...(previousFreebies[liaisonId] || []),
            ...usedThisRound
        ];
        const freebie = generateFreebie(canvas, target, alreadyGiven);
        result[liaisonId] = freebie;
        usedThisRound.push(freebie);
    }

    return result;
}

/**
 * Process a liaison's question and return feedback
 */
export function processLiaisonQuestion(
    category: 'locate' | 'diagnose' | 'prescribe' | 'validate',
    choice: string | { zone: Zone; slot: SlotType } | undefined,
    canvas: Canvas,
    target: Target
): string {
    switch (category) {
        case 'locate':
            if (choice === 'zones' || choice === 'slots') {
                return locate(choice, canvas, target);
            }
            return 'Invalid choice for Locate';

        case 'diagnose':
            if (typeof choice === 'string') {
                if (ZONES.includes(choice as Zone)) {
                    return diagnose(choice as Zone, canvas, target);
                }
                if (SLOT_TYPES.includes(choice as SlotType)) {
                    return diagnose(choice as SlotType, canvas, target);
                }
            }
            return 'Invalid choice for Diagnose';

        case 'prescribe':
            return prescribe(canvas, target);

        case 'validate':
            if (typeof choice === 'object' && choice !== null && 'zone' in choice && 'slot' in choice) {
                return validate(choice.zone, choice.slot, canvas, target);
            }
            return 'Invalid choice for Validate';

        default:
            return 'Unknown question category';
    }
}
