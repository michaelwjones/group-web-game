// Core types for Blind Artists

export type Zone = 'back' | 'mid' | 'fore' | 'focus';
export type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
export type Color = 'red' | 'yellow' | 'blue' | 'orange' | 'green' | 'purple';
export type Pigment = 'red' | 'yellow' | 'blue';
export type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';

export const ZONES: Zone[] = ['back', 'mid', 'fore', 'focus'];
export const SLOT_TYPES: SlotType[] = ['primary', 'secondary', 'highlight', 'shadow'];
export const COLORS: Color[] = ['red', 'yellow', 'blue', 'orange', 'green', 'purple'];
export const PIGMENTS: Pigment[] = ['red', 'yellow', 'blue'];

// Color mixing: which pigments combine to make each color
export const COLOR_TO_PIGMENTS: Record<Color, Pigment[]> = {
    red: ['red'],
    yellow: ['yellow'],
    blue: ['blue'],
    orange: ['red', 'yellow'],
    green: ['yellow', 'blue'],
    purple: ['red', 'blue']
};

// Hidden state (server only)
export interface BlindArtistsHidden {
    target: Record<Zone, Record<SlotType, Color>>;
    canvas: Record<Zone, Record<SlotType, Color | null>>;
    pigments: Record<string, Pigment>;
    roles: Record<string, Role>;
    seatingOrder: string[];
    elements: Record<Zone, string>;
    pigmentUses: Record<string, number>; // lifetime uses per player
    currentChoices: Record<string, unknown>;
    liaisonKnowledge: Record<string, { zone: Zone; element: string }[]>;
}

// Public state (visible to all)
export interface BlindArtistsPublic {
    canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
    pigmentUsesRemaining: Record<string, number>;
    selfAssessments: Record<string, Pigment | 'unknown'>;
    roles: Record<string, Role>;
    seatingOrder: string[];
    roundNumber: number;
    totalRounds: number;
    submittedPlayers: string[];
    slotClaims: Record<string, { zone: Zone; slot: SlotType } | null>; // painter -> claimed slot
}

// Per-player private state
export interface BlindArtistsPlayerPrivate {
    role: Role;
    clue: string;
    liaisonElements?: { zone: Zone; element: string }[]; // Liaisons only
    sceneType?: string; // Liaisons only: "Landscape"
    feedback?: string[]; // Liaison question answers (accumulates)
    freeFeedback?: string[]; // Freebie feedback (accumulates)
}

// Round data sent to clients
export interface BlindArtistsRoundData {
    roundNumber: number;
    totalRounds: number;
    canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
}

// Response types for each role
export interface FineBrushResponse {
    type: 'fine-brush';
    targetPlayer: string;
}

export interface ThickBrushResponse {
    type: 'thick-brush';
    targetPlayers: [string, string];
}

export interface PainterResponse {
    type: 'painter';
    brushPlayer: string;
    zone: Zone;
    slot: SlotType;
}

export type LiaisonQuestionCategory = 'locate' | 'diagnose' | 'prescribe' | 'validate';

export interface LiaisonResponse {
    type: 'liaison';
    category: LiaisonQuestionCategory;
    // For locate: 'zones' | 'slots'
    // For diagnose: Zone | SlotType
    // For validate: { zone: Zone; slot: SlotType }
    choice?: string | { zone: Zone; slot: SlotType };
}

export type PlayerResponse = FineBrushResponse | ThickBrushResponse | PainterResponse | LiaisonResponse;

// Round results
export interface BlindArtistsRoundResults {
    roundNumber: number;
    strokesApplied: number;
    slotsNowOccupied: number;
}

// Final results
export interface BlindArtistsFinalResults {
    tier: 'masterpiece' | 'impressed' | 'satisfied' | 'rejected';
    correctSlots: number;
    totalSlots: number;
    target: Record<Zone, Record<SlotType, Color>>;
    canvas: Record<Zone, Record<SlotType, Color | null>>;
    elements: Record<Zone, string>;
    pigmentAssignments: Record<string, Pigment>;
}

// Self-assessment action
export interface SelfAssessmentAction {
    type: 'self-assessment';
    pigment: Pigment | 'unknown';
}

// Helper to create empty canvas structures
export function createEmptySlotRecord<T>(value: T): Record<Zone, Record<SlotType, T>> {
    return {
        back: { primary: value, secondary: value, highlight: value, shadow: value },
        mid: { primary: value, secondary: value, highlight: value, shadow: value },
        fore: { primary: value, secondary: value, highlight: value, shadow: value },
        focus: { primary: value, secondary: value, highlight: value, shadow: value }
    };
}
