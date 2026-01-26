import type { GamePlugin, PlayerResponse, RoundStartData, GameSession, GameConfig } from '@game/shared';
import type {
    BlindArtistsHiddenState,
    BlindArtistsPublicState,
    BlindArtistsPrivateState,
    BlindArtistsRoundData,
    BlindArtistsRoundResults,
    BlindArtistsFinalResults,
    PlayerAction,
    BrushType,
    ConstraintType,
    Stroke,
    RevealedStroke,
    Clue,
    ZoneId,
    BRUSH_PLAYER_COUNT
} from './types.js';
import { mixPigments } from './color-mixer.js';
import { generateTarget, assignPigments, shuffleArray, calculateZoneCount } from './target-generator.js';
import { generatePigmentHints, generateDecisionFeedback } from './clue-generator.js';

const BRUSHES: BrushType[] = ['fine', 'medium', 'broad'];
const CONSTRAINTS: ConstraintType[] = ['left', 'right', 'neighbors', 'self'];
const DEFAULT_ROUNDS = 5;
const ROUND_TIME_LIMIT = 120000; // 2 minutes per round

type BlindArtistsSession = GameSession<
    BlindArtistsHiddenState,
    BlindArtistsPublicState,
    BlindArtistsPrivateState
>;

export const blindArtistsPlugin: GamePlugin<
    BlindArtistsHiddenState,
    BlindArtistsPublicState,
    BlindArtistsPrivateState,
    BlindArtistsRoundData,
    BlindArtistsRoundResults,
    BlindArtistsFinalResults
> = {
    id: 'blind-artists',
    name: 'Blind Artists',
    minPlayers: 12,
    maxPlayers: 20,
    defaultRounds: DEFAULT_ROUNDS,

    createInitialState(players: string[], config: GameConfig) {
        const playerCount = players.length;
        const zones = calculateZoneCount(playerCount);

        // Generate target painting
        const target = generateTarget(playerCount);

        // Assign pigments to players
        const playerPigments = assignPigments(players);

        // Create random seating order
        const seatOrder = shuffleArray([...players]);

        // Assign brushes and constraints
        const brushAssignments = assignBrushes(players);
        const constraintAssignments = assignConstraints(players);

        // Create player names map (will be populated from session)
        const playerNames: Record<string, string> = {};

        // Initialize player private states
        const playerPrivate = new Map<string, BlindArtistsPrivateState>();
        seatOrder.forEach((playerId, index) => {
            playerPrivate.set(playerId, {
                brush: brushAssignments.get(playerId)!,
                constraint: constraintAssignments.get(playerId)!,
                seatPosition: index,
                clues: [],
                seatOrder,
                playerNames
            });
        });

        return {
            hidden: {
                target,
                playerPigments,
                canvas: new Map<ZoneId, Stroke[]>(),
                perfectStrokes: [],
                seatOrder,
                pendingClues: []
            },
            public: {
                zones,
                revealedStrokes: [],
                strokesSubmitted: 0,
                totalPlayers: playerCount,
                round: 0,
                publicClues: []
            },
            playerPrivate
        };
    },

    onRoundStart(
        roundNumber: number,
        session: BlindArtistsSession
    ): RoundStartData<BlindArtistsRoundData> {
        const { hiddenState, publicState, playerPrivateState, players } = session;

        // Build player names map
        const playerNames: Record<string, string> = {};
        for (const player of players.values()) {
            playerNames[player.id] = player.name;
        }

        // Update player private state with names
        const updatedPlayerPrivate = new Map<string, BlindArtistsPrivateState>();
        for (const [playerId, state] of playerPrivateState) {
            updatedPlayerPrivate.set(playerId, {
                ...state,
                playerNames
            });
        }

        // Generate clues based on round
        let publicClues: Clue[] = [];

        if (roundNumber === 1) {
            // Round 1: Generate pigment hints
            publicClues = generatePigmentHints(
                hiddenState.playerPigments,
                hiddenState.seatOrder,
                playerNames
            );
        } else {
            // Round 2+: Generate decision feedback
            publicClues = generateDecisionFeedback(
                hiddenState,
                roundNumber,
                playerNames
            );
        }

        // Prepare round data
        const roundData: BlindArtistsRoundData = {
            round: roundNumber,
            totalRounds: session.totalRounds,
            zones: publicState.zones,
            revealedStrokes: hiddenState.perfectStrokes,
            publicClues
        };

        return {
            roundData,
            hiddenData: {
                ...hiddenState,
                pendingClues: publicClues
            },
            playerPrivateData: updatedPlayerPrivate,
            timeLimit: ROUND_TIME_LIMIT
        };
    },

    validateResponse(
        playerId: string,
        response: unknown,
        session: BlindArtistsSession
    ): { valid: boolean; error?: string } {
        if (typeof response !== 'object' || response === null) {
            return { valid: false, error: 'Response must be an object' };
        }

        const action = response as PlayerAction;

        // Validate zone
        if (typeof action.zone !== 'number' || action.zone < 0 || action.zone >= session.publicState.zones) {
            return { valid: false, error: 'Invalid zone selection' };
        }

        // Validate selected players
        if (!Array.isArray(action.selectedPlayers)) {
            return { valid: false, error: 'Selected players must be an array' };
        }

        const privateState = session.playerPrivateState.get(playerId);
        if (!privateState) {
            return { valid: false, error: 'Player state not found' };
        }

        // Check brush player count
        const expectedCount = getBrushPlayerCount(privateState.brush);
        if (action.selectedPlayers.length !== expectedCount) {
            return {
                valid: false,
                error: `${privateState.brush} brush requires selecting ${expectedCount} player(s)`
            };
        }

        // Validate constraint
        const constraintValid = validateConstraint(
            playerId,
            action.selectedPlayers,
            privateState.constraint,
            privateState.seatPosition,
            privateState.seatOrder
        );

        if (!constraintValid.valid) {
            return constraintValid;
        }

        // Validate that selected players exist
        for (const selectedId of action.selectedPlayers) {
            if (!session.players.has(selectedId)) {
                return { valid: false, error: `Selected player ${selectedId} not found` };
            }
        }

        return { valid: true };
    },

    onResponseReceived(
        playerId: string,
        response: unknown,
        session: BlindArtistsSession
    ) {
        return {
            hidden: session.hiddenState,
            public: {
                ...session.publicState,
                strokesSubmitted: session.publicState.strokesSubmitted + 1
            }
        };
    },

    onAllResponsesReceived(
        responses: PlayerResponse[],
        session: BlindArtistsSession
    ) {
        const { hiddenState, publicState } = session;
        const newCanvas = new Map(hiddenState.canvas);
        const newPerfectStrokes: RevealedStroke[] = [];

        // Process each player's action
        for (const response of responses) {
            const action = response.response as PlayerAction;
            const playerId = response.playerId;

            // Get pigments from selected players
            const pigments = action.selectedPlayers.map(
                (id) => hiddenState.playerPigments.get(id)!
            );

            // Mix pigments to get resulting color
            const color = mixPigments(pigments);

            // Create the stroke
            const stroke: Stroke = {
                zoneId: action.zone,
                color,
                paintedBy: playerId,
                contributingPlayers: action.selectedPlayers,
                round: session.currentRound
            };

            // Add to canvas
            const zoneStrokes = newCanvas.get(action.zone) ?? [];
            newCanvas.set(action.zone, [...zoneStrokes, stroke]);

            // Check if this stroke matches a target stroke in the zone
            const matchingTarget = hiddenState.target.strokes.find(
                (t) =>
                    t.zoneId === action.zone &&
                    t.requiredColor === color &&
                    !hiddenState.perfectStrokes.some(
                        (p) => p.zoneId === t.zoneId && p.color === t.requiredColor
                    ) &&
                    !newPerfectStrokes.some(
                        (p) => p.zoneId === t.zoneId && p.color === t.requiredColor
                    )
            );

            if (matchingTarget) {
                newPerfectStrokes.push({
                    zoneId: action.zone,
                    color,
                    round: session.currentRound
                });
            }
        }

        // Combine with existing perfect strokes
        const allPerfectStrokes = [...hiddenState.perfectStrokes, ...newPerfectStrokes];

        // Check win condition
        const gameWon = allPerfectStrokes.length >= hiddenState.target.strokes.length;

        // Generate client hints for results display
        const clientHints = hiddenState.pendingClues;

        const results: BlindArtistsRoundResults = {
            round: session.currentRound,
            newPerfectStrokes,
            allPerfectStrokes,
            clientHints,
            strokesAttempted: responses.length,
            gameWon
        };

        return {
            results,
            hidden: {
                ...hiddenState,
                canvas: newCanvas,
                perfectStrokes: allPerfectStrokes
            },
            public: {
                ...publicState,
                revealedStrokes: allPerfectStrokes,
                strokesSubmitted: 0,
                round: session.currentRound,
                publicClues: clientHints
            }
        };
    },

    calculateScores(
        results: BlindArtistsRoundResults,
        currentScores: Map<string, number>,
        session: BlindArtistsSession
    ): Map<string, number> {
        // In Blind Artists, scoring is collaborative
        // All players get points when perfect strokes are made
        const newScores = new Map(currentScores);
        const pointsPerStroke = 100;

        // Award points to all players for each new perfect stroke
        if (results.newPerfectStrokes.length > 0) {
            const pointsEarned = results.newPerfectStrokes.length * pointsPerStroke;
            for (const playerId of session.players.keys()) {
                const current = newScores.get(playerId) ?? 0;
                newScores.set(playerId, current + pointsEarned);
            }
        }

        // Bonus points for winning
        if (results.gameWon) {
            for (const playerId of session.players.keys()) {
                const current = newScores.get(playerId) ?? 0;
                newScores.set(playerId, current + 500);
            }
        }

        return newScores;
    },

    onGameEnd(session: BlindArtistsSession): BlindArtistsFinalResults {
        const { hiddenState } = session;
        const won = hiddenState.perfectStrokes.length >= hiddenState.target.strokes.length;

        return {
            won,
            perfectStrokes: hiddenState.perfectStrokes,
            totalTarget: hiddenState.target.strokes.length,
            revealedTarget: hiddenState.target.strokes
        };
    },

    shouldAutoAdvance(session: BlindArtistsSession): boolean {
        // Auto-advance when all players have submitted
        return session.publicState.strokesSubmitted >= session.publicState.totalPlayers;
    }
};

/**
 * Assign brushes to players, distributing them roughly equally.
 */
function assignBrushes(players: string[]): Map<string, BrushType> {
    const assignments = new Map<string, BrushType>();
    const shuffled = shuffleArray([...players]);

    shuffled.forEach((playerId, index) => {
        assignments.set(playerId, BRUSHES[index % BRUSHES.length]);
    });

    return assignments;
}

/**
 * Assign constraints to players, distributing them roughly equally.
 */
function assignConstraints(players: string[]): Map<string, ConstraintType> {
    const assignments = new Map<string, ConstraintType>();
    const shuffled = shuffleArray([...players]);

    shuffled.forEach((playerId, index) => {
        assignments.set(playerId, CONSTRAINTS[index % CONSTRAINTS.length]);
    });

    return assignments;
}

/**
 * Get the number of players a brush can select.
 */
function getBrushPlayerCount(brush: BrushType): number {
    switch (brush) {
        case 'fine':
            return 1;
        case 'medium':
            return 2;
        case 'broad':
            return 3;
    }
}

/**
 * Validate that player selection satisfies the constraint.
 */
function validateConstraint(
    playerId: string,
    selectedPlayers: string[],
    constraint: ConstraintType,
    seatPosition: number,
    seatOrder: string[]
): { valid: boolean; error?: string } {
    const totalPlayers = seatOrder.length;

    // Get positions of selected players
    const selectedPositions = selectedPlayers.map((id) => seatOrder.indexOf(id));

    switch (constraint) {
        case 'self':
            // Must include self
            if (!selectedPlayers.includes(playerId)) {
                return { valid: false, error: 'Self constraint requires including yourself' };
            }
            // Other selections must be adjacent
            for (const pos of selectedPositions) {
                if (pos === seatPosition) continue;
                const distance = Math.min(
                    Math.abs(pos - seatPosition),
                    totalPlayers - Math.abs(pos - seatPosition)
                );
                if (distance > 1) {
                    return { valid: false, error: 'Other selected players must be adjacent to you' };
                }
            }
            break;

        case 'left':
            // All selections must be to the left (lower seat positions, wrapping)
            for (const pos of selectedPositions) {
                // Calculate if position is "to the left" (considering wrap-around)
                const leftPos = (seatPosition - 1 + totalPlayers) % totalPlayers;
                const farLeftPos = (seatPosition - selectedPlayers.length + totalPlayers) % totalPlayers;

                // Check if selection is within the left range
                let isLeft = false;
                for (let i = 1; i <= selectedPlayers.length; i++) {
                    const validPos = (seatPosition - i + totalPlayers) % totalPlayers;
                    if (pos === validPos) {
                        isLeft = true;
                        break;
                    }
                }
                if (!isLeft && pos !== seatPosition) {
                    return { valid: false, error: 'Left constraint requires selecting from players to your left' };
                }
            }
            // Selections must be adjacent to each other
            if (!arePositionsAdjacent(selectedPositions, totalPlayers)) {
                return { valid: false, error: 'Selected players must be adjacent' };
            }
            break;

        case 'right':
            // All selections must be to the right (higher seat positions, wrapping)
            for (const pos of selectedPositions) {
                let isRight = false;
                for (let i = 1; i <= selectedPlayers.length; i++) {
                    const validPos = (seatPosition + i) % totalPlayers;
                    if (pos === validPos) {
                        isRight = true;
                        break;
                    }
                }
                if (!isRight && pos !== seatPosition) {
                    return { valid: false, error: 'Right constraint requires selecting from players to your right' };
                }
            }
            // Selections must be adjacent to each other
            if (!arePositionsAdjacent(selectedPositions, totalPlayers)) {
                return { valid: false, error: 'Selected players must be adjacent' };
            }
            break;

        case 'neighbors':
            // All selections must be adjacent to the player
            for (const pos of selectedPositions) {
                const distance = Math.min(
                    Math.abs(pos - seatPosition),
                    totalPlayers - Math.abs(pos - seatPosition)
                );
                if (distance > 1) {
                    return { valid: false, error: 'Neighbors constraint requires selecting adjacent players' };
                }
            }
            break;
    }

    return { valid: true };
}

/**
 * Check if all positions are adjacent (form a contiguous group).
 */
function arePositionsAdjacent(positions: number[], totalPlayers: number): boolean {
    if (positions.length <= 1) return true;

    const sorted = [...positions].sort((a, b) => a - b);

    // Check if positions form a contiguous sequence
    for (let i = 1; i < sorted.length; i++) {
        const gap = sorted[i] - sorted[i - 1];
        if (gap !== 1 && !(i === sorted.length - 1 && sorted[0] === 0 && sorted[i] === totalPlayers - 1)) {
            // Allow wrap-around: first position 0 and last position totalPlayers-1 are adjacent
            if (!(sorted[0] === 0 && sorted[sorted.length - 1] === totalPlayers - 1)) {
                return false;
            }
        }
    }

    return true;
}

export default blindArtistsPlugin;
