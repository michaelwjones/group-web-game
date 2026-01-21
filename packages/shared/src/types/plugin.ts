import type { GameSession, GameConfig } from './game-state.js';

export interface PlayerResponse {
    playerId: string;
    response: unknown;
    receivedAt: number;
}

export interface RoundStartData<T = unknown> {
    roundData: T;
    hiddenData: unknown;
    timeLimit?: number;
    playerPrivateData?: Map<string, unknown>;
}

export interface GamePlugin<
    THidden = unknown,
    TPublic = unknown,
    TPlayerPrivate = unknown,
    TRoundData = unknown,
    TRoundResults = unknown,
    TFinalResults = unknown
> {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
    defaultRounds: number;

    createInitialState(
        players: string[],
        config: GameConfig
    ): {
        hidden: THidden;
        public: TPublic;
        playerPrivate: Map<string, TPlayerPrivate>;
    };

    onRoundStart(
        roundNumber: number,
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): RoundStartData<TRoundData>;

    validateResponse(
        playerId: string,
        response: unknown,
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): { valid: boolean; error?: string };

    onResponseReceived(
        playerId: string,
        response: unknown,
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): {
        hidden: THidden;
        public: TPublic;
        playerPrivate?: Map<string, TPlayerPrivate>;
    };

    onAllResponsesReceived(
        responses: PlayerResponse[],
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): {
        results: TRoundResults;
        hidden: THidden;
        public: TPublic;
        playerPrivate?: Map<string, TPlayerPrivate>;
    };

    calculateScores(
        results: TRoundResults,
        currentScores: Map<string, number>,
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): Map<string, number>;

    onGameEnd(
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): TFinalResults;

    shouldAutoAdvance?(
        session: GameSession<THidden, TPublic, TPlayerPrivate>
    ): boolean;
}

export type AnyGamePlugin = GamePlugin<unknown, unknown, unknown, unknown, unknown, unknown>;
