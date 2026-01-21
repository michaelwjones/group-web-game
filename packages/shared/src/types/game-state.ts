import type { ConnectionInfo, Player, PlayerPublic } from './player.js';

export type GameStatus = 'lobby' | 'in_progress' | 'between_rounds' | 'ended';

export interface GameSession<THidden = unknown, TPublic = unknown, TPlayerPrivate = unknown> {
    id: string;
    code: string;
    status: GameStatus;
    gameType: string;
    displayConnection: ConnectionInfo | null;
    players: Map<string, Player>;
    hostId: string | null;
    currentRound: number;
    totalRounds: number;
    roundStartedAt: number | null;
    roundTimeLimit: number | null;
    hiddenState: THidden;
    publicState: TPublic;
    playerPrivateState: Map<string, TPlayerPrivate>;
    config: GameConfig;
    createdAt: number;
}

export interface GameConfig {
    minPlayers: number;
    maxPlayers: number;
    totalRounds: number;
    roundTimeLimit?: number;
    customConfig?: Record<string, unknown>;
}

export interface GameStateForDisplay<TPublic = unknown> {
    code: string;
    status: GameStatus;
    gameType: string;
    players: PlayerPublic[];
    hostId: string | null;
    currentRound: number;
    totalRounds: number;
    roundStartedAt: number | null;
    roundTimeLimit: number | null;
    publicState: TPublic;
}

export interface GameStateForPlayer<TPublic = unknown, TPlayerPrivate = unknown> {
    code: string;
    status: GameStatus;
    gameType: string;
    players: PlayerPublic[];
    hostId: string | null;
    currentRound: number;
    totalRounds: number;
    roundStartedAt: number | null;
    roundTimeLimit: number | null;
    publicState: TPublic;
    privateState: TPlayerPrivate | null;
    selfId: string;
    isHost: boolean;
}

export interface RoundData<T = unknown> {
    roundNumber: number;
    data: T;
    timeLimit: number | null;
    startedAt: number;
}

export interface RoundResults<T = unknown> {
    roundNumber: number;
    results: T;
    scores: Record<string, number>;
    scoreChanges: Record<string, number>;
}

export interface FinalResults<T = unknown> {
    rankings: Array<{
        playerId: string;
        playerName: string;
        score: number;
        rank: number;
    }>;
    gameData: T;
}
