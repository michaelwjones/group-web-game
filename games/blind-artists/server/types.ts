// Pigment types - the hidden colors assigned to each player
export type Pigment = 'red' | 'yellow' | 'blue';

// Stroke colors - the results of combining pigments
export type StrokeColor =
    | 'red'      // Single red
    | 'yellow'   // Single yellow
    | 'blue'     // Single blue
    | 'purple'   // Red + Blue
    | 'green'    // Yellow + Blue
    | 'orange'   // Red + Yellow
    | 'black';   // Red + Yellow + Blue

// Brush types determine how many players are selected
export type BrushType = 'fine' | 'medium' | 'broad';

// Constraints restrict which players can be selected
export type ConstraintType = 'left' | 'right' | 'neighbors' | 'self';

// Zone identifier
export type ZoneId = number;

// A stroke requirement in the target painting
export interface TargetStroke {
    zoneId: ZoneId;
    requiredColor: StrokeColor;
}

// The target painting that players must recreate
export interface TargetPainting {
    zones: number;
    strokes: TargetStroke[];
}

// A painted stroke on the canvas
export interface Stroke {
    zoneId: ZoneId;
    color: StrokeColor;
    paintedBy: string;           // Player ID who painted it
    contributingPlayers: string[]; // Player IDs whose pigments were used
    round: number;
}

// A perfect stroke that has been revealed
export interface RevealedStroke {
    zoneId: ZoneId;
    color: StrokeColor;
    round: number;
}

// Clue types
export type ClueType =
    | 'pigment_hint'      // Round 1: hints about pigments
    | 'decision_feedback'; // Round 2+: feedback on previous decisions

export interface Clue {
    type: ClueType;
    text: string;
    round: number;
    isPublic: boolean;     // If true, shown on display board
}

// Player action - what they submit each round
export interface PlayerAction {
    zone: ZoneId;
    selectedPlayers: string[];
}

// Hidden state - server only
export interface BlindArtistsHiddenState {
    target: TargetPainting;
    playerPigments: Map<string, Pigment>;
    canvas: Map<ZoneId, Stroke[]>;         // All strokes painted so far
    perfectStrokes: RevealedStroke[];       // Strokes that matched the target
    seatOrder: string[];                    // Player IDs in seating order
    pendingClues: Clue[];                   // Public clues to show on display
}

// Public state - visible to all players
export interface BlindArtistsPublicState {
    zones: number;
    revealedStrokes: RevealedStroke[];
    strokesSubmitted: number;
    totalPlayers: number;
    round: number;
    publicClues: Clue[];                    // Client hints shown on display
}

// Player private state - unique to each player
export interface BlindArtistsPrivateState {
    brush: BrushType;
    constraint: ConstraintType;
    seatPosition: number;
    clues: Clue[];
    seatOrder: string[];                    // For adjacency reference
    playerNames: Record<string, string>;    // Player ID to name mapping
}

// Round data sent to players at start of each round
export interface BlindArtistsRoundData {
    round: number;
    totalRounds: number;
    zones: number;
    revealedStrokes: RevealedStroke[];
    publicClues: Clue[];
}

// Results after a round
export interface BlindArtistsRoundResults {
    round: number;
    newPerfectStrokes: RevealedStroke[];
    allPerfectStrokes: RevealedStroke[];
    clientHints: Clue[];
    strokesAttempted: number;
    gameWon: boolean;
}

// Final game results
export interface BlindArtistsFinalResults {
    won: boolean;
    perfectStrokes: RevealedStroke[];
    totalTarget: number;
    revealedTarget: TargetStroke[];
}

// Brush selection count mapping
export const BRUSH_PLAYER_COUNT: Record<BrushType, number> = {
    fine: 1,
    medium: 2,
    broad: 3
};

// Pigment distribution ratios (approximate thirds)
export const PIGMENTS: Pigment[] = ['red', 'yellow', 'blue'];
