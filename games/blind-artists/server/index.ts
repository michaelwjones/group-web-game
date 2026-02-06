import type { GamePlugin, PlayerResponse as PluginPlayerResponse, RoundStartData, GameSession, GameConfig } from '@game/shared';
import type {
    BlindArtistsHidden,
    BlindArtistsPublic,
    BlindArtistsPlayerPrivate,
    BlindArtistsRoundData,
    BlindArtistsRoundResults,
    BlindArtistsFinalResults,
    PlayerResponse,
    Role,
    Zone,
    SlotType,
    Pigment,
    Color,
    SelfAssessmentAction
} from './types.js';
import { ZONES, SLOT_TYPES, COLOR_TO_PIGMENTS, createEmptySlotRecord } from './types.js';
import { generateValidGame } from './content.js';
import { generateAllClues } from './clues.js';
import { processLiaisonQuestion, generateFreebiesForLiaisons } from './feedback.js';

const MAX_PIGMENT_USES = 5;
const ROLE_DISTRIBUTION: Role[] = [
    'fine-brush', 'fine-brush',
    'thick-brush', 'thick-brush',
    'painter', 'painter', 'painter', 'painter', 'painter',
    'liaison', 'liaison', 'liaison'
];

function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function getNeighbors(playerId: string, seatingOrder: string[]): string[] {
    const idx = seatingOrder.indexOf(playerId);
    if (idx === -1) return [];
    const left = seatingOrder[(idx - 1 + seatingOrder.length) % seatingOrder.length];
    const right = seatingOrder[(idx + 1) % seatingOrder.length];
    return [left, right];
}

function areAdjacent(player1: string, player2: string, seatingOrder: string[]): boolean {
    const neighbors = getNeighbors(player1, seatingOrder);
    return neighbors.includes(player2);
}

function resolveBrushColor(pigments: Pigment[]): Color {
    const sorted = [...pigments].sort();
    if (sorted.length === 1) {
        return sorted[0] as Color;
    }
    if (sorted.length === 2) {
        const [a, b] = sorted;
        if (a === 'blue' && b === 'yellow') return 'green';
        if (a === 'blue' && b === 'red') return 'purple';
        if (a === 'red' && b === 'yellow') return 'orange';
        // Same pigment twice = primary color
        if (a === b) return a as Color;
    }
    // Fallback for unexpected cases
    return pigments[0] as Color;
}

export const blindArtistsPlugin: GamePlugin<
    BlindArtistsHidden,
    BlindArtistsPublic,
    BlindArtistsPlayerPrivate,
    BlindArtistsRoundData,
    BlindArtistsRoundResults,
    BlindArtistsFinalResults
> = {
    id: 'blind-artists',
    name: 'Blind Artists',
    minPlayers: 12,
    maxPlayers: 12,
    defaultRounds: 5,
    mutableResponses: true,
    hostControlledRounds: true,

    createInitialState(players: string[], config: GameConfig) {
        // Get seating order from config or use player order
        const seatingOrder: string[] = (config.customConfig?.seatingOrder as string[]) || [...players];

        // Generate target, elements, and pigment distribution
        const { target, elements, pigments } = generateValidGame(players);

        // Assign roles randomly
        const shuffledRoles = shuffle([...ROLE_DISTRIBUTION]);
        const roles: Record<string, Role> = {};
        for (let i = 0; i < players.length; i++) {
            roles[players[i]] = shuffledRoles[i];
        }

        // Create player names map (using player IDs as names for now - real names come from session)
        const playerNames: Record<string, string> = {};
        for (const playerId of players) {
            playerNames[playerId] = playerId; // Will be replaced with real names in actual usage
        }

        // Generate starting clues for all players
        const clues = generateAllClues(players, pigments, seatingOrder, playerNames);

        // Assign liaison knowledge - each liaison learns 3 of 4 zone elements
        const liaisonIds = players.filter(id => roles[id] === 'liaison');
        const liaisonKnowledge: Record<string, { zone: Zone; element: string }[]> = {};

        // Each liaison gets 3 zones (one zone remains unknown to all)
        const shuffledZones = shuffle([...ZONES]);
        for (let i = 0; i < liaisonIds.length; i++) {
            const liaisonId = liaisonIds[i];
            // Give each liaison 3 zones, rotating which one is missing
            const missingZoneIdx = i % 4;
            const knownZones = shuffledZones.filter((_, idx) => idx !== missingZoneIdx);
            liaisonKnowledge[liaisonId] = knownZones.map(zone => ({
                zone,
                element: elements[zone]
            }));
        }

        // Initialize pigment uses
        const pigmentUses: Record<string, number> = {};
        const pigmentUsesRemaining: Record<string, number> = {};
        for (const playerId of players) {
            pigmentUses[playerId] = 0;
            pigmentUsesRemaining[playerId] = MAX_PIGMENT_USES;
        }

        // Initialize self-assessments
        const selfAssessments: Record<string, Pigment | 'unknown'> = {};
        for (const playerId of players) {
            selfAssessments[playerId] = 'unknown';
        }

        // Create initial hidden state
        const hidden: BlindArtistsHidden = {
            target,
            canvas: createEmptySlotRecord<Color | null>(null),
            pigments,
            roles,
            seatingOrder,
            elements,
            pigmentUses,
            currentChoices: {},
            liaisonKnowledge
        };

        // Create initial public state
        const publicState: BlindArtistsPublic = {
            canvasOccupied: createEmptySlotRecord<boolean>(false),
            pigmentUsesRemaining,
            selfAssessments,
            roles,
            seatingOrder,
            roundNumber: 0,
            totalRounds: config.totalRounds,
            submittedPlayers: [],
            slotClaims: {}
        };

        // Create per-player private state
        const playerPrivate = new Map<string, BlindArtistsPlayerPrivate>();
        for (const playerId of players) {
            const role = roles[playerId];
            const privateState: BlindArtistsPlayerPrivate = {
                role,
                clue: clues[playerId]
            };

            if (role === 'liaison') {
                privateState.liaisonElements = liaisonKnowledge[playerId];
                privateState.sceneType = 'Landscape';
                privateState.feedback = [];
                privateState.freeFeedback = [];
            }

            playerPrivate.set(playerId, privateState);
        }

        return { hidden, public: publicState, playerPrivate };
    },

    onRoundStart(
        roundNumber: number,
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ): RoundStartData<BlindArtistsRoundData> {
        // Clear current choices and slot claims
        const newHidden: BlindArtistsHidden = {
            ...session.hiddenState,
            currentChoices: {}
        };

        const newPublic: BlindArtistsPublic = {
            ...session.publicState,
            roundNumber,
            submittedPlayers: [],
            slotClaims: {}
        };

        // Return round data
        return {
            roundData: {
                roundNumber,
                totalRounds: session.totalRounds,
                canvasOccupied: session.publicState.canvasOccupied
            },
            hiddenData: newHidden,
            playerPrivateData: session.playerPrivateState
        };
    },

    validateResponse(
        playerId: string,
        response: unknown,
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ): { valid: boolean; error?: string } {
        const resp = response as PlayerResponse;
        const role = session.hiddenState.roles[playerId];

        if (!resp || typeof resp !== 'object' || !('type' in resp)) {
            return { valid: false, error: 'Invalid response format' };
        }

        switch (role) {
            case 'fine-brush': {
                if (resp.type !== 'fine-brush') {
                    return { valid: false, error: 'Wrong response type for Fine Brush' };
                }
                const { targetPlayer } = resp;
                if (!session.hiddenState.seatingOrder.includes(targetPlayer)) {
                    return { valid: false, error: 'Invalid target player' };
                }
                // Check pigment uses - we allow selecting even if at limit during round,
                // validation happens at resolution
                return { valid: true };
            }

            case 'thick-brush': {
                if (resp.type !== 'thick-brush') {
                    return { valid: false, error: 'Wrong response type for Thick Brush' };
                }
                const { targetPlayers } = resp;
                if (!Array.isArray(targetPlayers) || targetPlayers.length !== 2) {
                    return { valid: false, error: 'Must select exactly 2 players' };
                }
                const [p1, p2] = targetPlayers;
                if (!session.hiddenState.seatingOrder.includes(p1) ||
                    !session.hiddenState.seatingOrder.includes(p2)) {
                    return { valid: false, error: 'Invalid target players' };
                }
                if (!areAdjacent(p1, p2, session.hiddenState.seatingOrder)) {
                    return { valid: false, error: 'Players must be adjacent' };
                }
                return { valid: true };
            }

            case 'painter': {
                if (resp.type !== 'painter') {
                    return { valid: false, error: 'Wrong response type for Painter' };
                }
                const { brushPlayer, zone, slot } = resp;
                // Validate brush player is actually a brush
                const brushRole = session.hiddenState.roles[brushPlayer];
                if (brushRole !== 'fine-brush' && brushRole !== 'thick-brush') {
                    return { valid: false, error: 'Selected player is not a brush' };
                }
                if (!ZONES.includes(zone)) {
                    return { valid: false, error: 'Invalid zone' };
                }
                if (!SLOT_TYPES.includes(slot)) {
                    return { valid: false, error: 'Invalid slot' };
                }
                // Check slot is not claimed by another painter
                const slotClaims = session.publicState.slotClaims as Record<string, { zone: Zone; slot: SlotType } | null>;
                for (const [otherId, claim] of Object.entries(slotClaims)) {
                    if (otherId !== playerId && claim &&
                        claim.zone === zone && claim.slot === slot) {
                        return { valid: false, error: 'Slot already claimed by another painter' };
                    }
                }
                return { valid: true };
            }

            case 'liaison': {
                if (resp.type !== 'liaison') {
                    return { valid: false, error: 'Wrong response type for Liaison' };
                }
                const { category, choice } = resp;
                if (!['locate', 'diagnose', 'prescribe', 'validate'].includes(category)) {
                    return { valid: false, error: 'Invalid question category' };
                }
                // Validate choice based on category
                if (category === 'locate' && choice !== 'zones' && choice !== 'slots') {
                    return { valid: false, error: 'Locate requires choosing zones or slots' };
                }
                if (category === 'diagnose') {
                    if (typeof choice !== 'string') {
                        return { valid: false, error: 'Diagnose requires a zone or slot type' };
                    }
                    if (!ZONES.includes(choice as Zone) && !SLOT_TYPES.includes(choice as SlotType)) {
                        return { valid: false, error: 'Invalid zone or slot type for Diagnose' };
                    }
                }
                if (category === 'validate') {
                    if (typeof choice !== 'object' || !choice ||
                        !('zone' in choice) || !('slot' in choice)) {
                        return { valid: false, error: 'Validate requires zone and slot' };
                    }
                }
                return { valid: true };
            }

            default:
                return { valid: false, error: 'Unknown role' };
        }
    },

    onResponseReceived(
        playerId: string,
        response: unknown,
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ) {
        const resp = response as PlayerResponse;
        const role = session.hiddenState.roles[playerId];

        // Update current choices
        const newCurrentChoices = { ...session.hiddenState.currentChoices };
        newCurrentChoices[playerId] = resp;

        // Update slot claims for painters
        const newSlotClaims = { ...session.publicState.slotClaims };
        if (role === 'painter' && resp.type === 'painter') {
            newSlotClaims[playerId] = { zone: resp.zone, slot: resp.slot };
        }

        // Update submitted players
        const newSubmittedPlayers = session.publicState.submittedPlayers.includes(playerId)
            ? session.publicState.submittedPlayers
            : [...session.publicState.submittedPlayers, playerId];

        return {
            hidden: {
                ...session.hiddenState,
                currentChoices: newCurrentChoices
            },
            public: {
                ...session.publicState,
                submittedPlayers: newSubmittedPlayers,
                slotClaims: newSlotClaims
            }
        };
    },

    onAllResponsesReceived(
        responses: PluginPlayerResponse[],
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ) {
        const hidden = session.hiddenState;
        const newCanvas = JSON.parse(JSON.stringify(hidden.canvas)) as typeof hidden.canvas;
        const newPigmentUses = { ...hidden.pigmentUses };
        const newPigmentUsesRemaining = { ...session.publicState.pigmentUsesRemaining };

        // Collect brush colors
        const brushColors: Record<string, Color> = {};

        // Process brush responses to determine colors
        for (const response of responses) {
            const resp = hidden.currentChoices[response.playerId] as PlayerResponse;
            if (!resp) continue;

            if (resp.type === 'fine-brush') {
                const targetPigment = hidden.pigments[resp.targetPlayer];
                brushColors[response.playerId] = resolveBrushColor([targetPigment]);
                // Increment pigment use
                if (newPigmentUses[resp.targetPlayer] < MAX_PIGMENT_USES) {
                    newPigmentUses[resp.targetPlayer]++;
                    newPigmentUsesRemaining[resp.targetPlayer]--;
                }
            } else if (resp.type === 'thick-brush') {
                const [p1, p2] = resp.targetPlayers;
                const pigment1 = hidden.pigments[p1];
                const pigment2 = hidden.pigments[p2];
                brushColors[response.playerId] = resolveBrushColor([pigment1, pigment2]);
                // Increment pigment uses
                for (const p of resp.targetPlayers) {
                    if (newPigmentUses[p] < MAX_PIGMENT_USES) {
                        newPigmentUses[p]++;
                        newPigmentUsesRemaining[p]--;
                    }
                }
            }
        }

        // Process painter responses to apply strokes
        let strokesApplied = 0;
        for (const response of responses) {
            const resp = hidden.currentChoices[response.playerId] as PlayerResponse;
            if (!resp || resp.type !== 'painter') continue;

            const brushColor = brushColors[resp.brushPlayer];
            if (brushColor) {
                newCanvas[resp.zone][resp.slot] = brushColor;
                strokesApplied++;
            }
        }

        // Count occupied slots
        let slotsNowOccupied = 0;
        const newCanvasOccupied = createEmptySlotRecord<boolean>(false);
        for (const zone of ZONES) {
            for (const slot of SLOT_TYPES) {
                if (newCanvas[zone][slot] !== null) {
                    newCanvasOccupied[zone][slot] = true;
                    slotsNowOccupied++;
                }
            }
        }

        // Process liaison responses and generate feedback
        const liaisonIds = Object.entries(hidden.roles)
            .filter(([_, role]) => role === 'liaison')
            .map(([id]) => id);

        const newPlayerPrivate = new Map<string, BlindArtistsPlayerPrivate>();
        for (const [id, state] of session.playerPrivateState.entries()) {
            newPlayerPrivate.set(id, state as BlindArtistsPlayerPrivate);
        }
        const previousFreebies: Record<string, string[]> = {};

        // First, gather previous freebies
        for (const liaisonId of liaisonIds) {
            const privateState = newPlayerPrivate.get(liaisonId);
            previousFreebies[liaisonId] = privateState?.freeFeedback || [];
        }

        // Generate freebies
        const freebies = generateFreebiesForLiaisons(liaisonIds, newCanvas, hidden.target, previousFreebies);

        // Process each liaison's question and update their private state
        for (const liaisonId of liaisonIds) {
            const resp = hidden.currentChoices[liaisonId] as PlayerResponse;
            const currentPrivate = newPlayerPrivate.get(liaisonId);
            if (!currentPrivate) continue;

            let questionFeedback = '';
            if (resp && resp.type === 'liaison') {
                questionFeedback = processLiaisonQuestion(
                    resp.category,
                    resp.choice,
                    newCanvas,
                    hidden.target
                );
            }

            const updatedPrivate: BlindArtistsPlayerPrivate = {
                ...currentPrivate,
                feedback: [...(currentPrivate.feedback || []), questionFeedback],
                freeFeedback: [...(currentPrivate.freeFeedback || []), freebies[liaisonId]]
            };
            newPlayerPrivate.set(liaisonId, updatedPrivate);
        }

        return {
            results: {
                roundNumber: session.publicState.roundNumber,
                strokesApplied,
                slotsNowOccupied
            },
            hidden: {
                ...hidden,
                canvas: newCanvas,
                pigmentUses: newPigmentUses,
                currentChoices: {}
            },
            public: {
                ...session.publicState,
                canvasOccupied: newCanvasOccupied,
                pigmentUsesRemaining: newPigmentUsesRemaining,
                submittedPlayers: [],
                slotClaims: {}
            },
            playerPrivate: newPlayerPrivate
        };
    },

    onPlayerAction(
        playerId: string,
        action: unknown,
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ) {
        const act = action as SelfAssessmentAction;

        if (act && act.type === 'self-assessment') {
            const newSelfAssessments = {
                ...session.publicState.selfAssessments,
                [playerId]: act.pigment
            };

            return {
                hidden: session.hiddenState,
                public: {
                    ...session.publicState,
                    selfAssessments: newSelfAssessments
                }
            };
        }

        // Unknown action type, return unchanged state
        return {
            hidden: session.hiddenState,
            public: session.publicState
        };
    },

    calculateScores(
        results: BlindArtistsRoundResults,
        currentScores: Map<string, number>,
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ): Map<string, number> {
        // Cooperative game - calculate score at end based on correct slots
        // For now, keep scores at 0 until game end
        return currentScores;
    },

    onGameEnd(
        session: GameSession<BlindArtistsHidden, BlindArtistsPublic, BlindArtistsPlayerPrivate>
    ): BlindArtistsFinalResults {
        const { target, canvas, elements, pigments } = session.hiddenState;

        // Count correct slots
        let correctSlots = 0;
        for (const zone of ZONES) {
            for (const slot of SLOT_TYPES) {
                if (canvas[zone][slot] === target[zone][slot]) {
                    correctSlots++;
                }
            }
        }

        // Determine tier
        let tier: 'masterpiece' | 'impressed' | 'satisfied' | 'rejected';
        if (correctSlots === 16) {
            tier = 'masterpiece';
        } else if (correctSlots >= 14) {
            tier = 'impressed';
        } else if (correctSlots >= 12) {
            tier = 'satisfied';
        } else {
            tier = 'rejected';
        }

        // Update all player scores to the correct count
        for (const player of session.players.values()) {
            player.score = correctSlots;
        }

        return {
            tier,
            correctSlots,
            totalSlots: 16,
            target,
            canvas,
            elements,
            pigmentAssignments: pigments
        };
    }
};

export default blindArtistsPlugin;
