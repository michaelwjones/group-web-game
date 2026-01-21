import type { GameStateForDisplay, GameStateForPlayer, RoundData, RoundResults, FinalResults } from './game-state.js';
import type { PlayerPublic } from './player.js';

// ============================================
// Client -> Server Messages
// ============================================

export interface C2S_GameCreate {
    type: 'game:create';
    gameType: string;
    config?: Record<string, unknown>;
}

export interface C2S_GameJoin {
    type: 'game:join';
    code: string;
    playerName: string;
}

export interface C2S_GameJoinDisplay {
    type: 'game:join-display';
    code: string;
}

export interface C2S_SessionReconnect {
    type: 'session:reconnect';
    sessionToken: string;
    code: string;
}

export interface C2S_HostClaim {
    type: 'host:claim';
}

export interface C2S_HostStart {
    type: 'host:start';
}

export interface C2S_HostNextRound {
    type: 'host:next-round';
}

export interface C2S_HostEndGame {
    type: 'host:end-game';
}

export interface C2S_PlayerResponse {
    type: 'player:response';
    response: unknown;
}

export interface C2S_Ping {
    type: 'ping';
}

export type ClientToServerMessage =
    | C2S_GameCreate
    | C2S_GameJoin
    | C2S_GameJoinDisplay
    | C2S_SessionReconnect
    | C2S_HostClaim
    | C2S_HostStart
    | C2S_HostNextRound
    | C2S_HostEndGame
    | C2S_PlayerResponse
    | C2S_Ping;

// ============================================
// Server -> Client Messages
// ============================================

export interface S2C_GameCreated {
    type: 'game:created';
    code: string;
    gameType: string;
}

export interface S2C_GameJoined {
    type: 'game:joined';
    sessionToken: string;
    playerId: string;
    state: GameStateForPlayer;
}

export interface S2C_DisplayJoined {
    type: 'display:joined';
    state: GameStateForDisplay;
}

export interface S2C_StateUpdate {
    type: 'state:update';
    state: GameStateForDisplay | GameStateForPlayer;
    isDisplay: boolean;
}

export interface S2C_PlayersUpdate {
    type: 'players:update';
    players: PlayerPublic[];
    hostId: string | null;
}

export interface S2C_HostChanged {
    type: 'host:changed';
    hostId: string;
    hostName: string;
}

export interface S2C_RoundStart<T = unknown> {
    type: 'round:start';
    round: RoundData<T>;
}

export interface S2C_RoundEnd<T = unknown> {
    type: 'round:end';
    results: RoundResults<T>;
}

export interface S2C_ResponseReceived {
    type: 'response:received';
    playerId: string;
}

export interface S2C_GameEnd<T = unknown> {
    type: 'game:end';
    results: FinalResults<T>;
}

export interface S2C_PlayerDisconnected {
    type: 'player:disconnected';
    playerId: string;
    playerName: string;
}

export interface S2C_PlayerReconnected {
    type: 'player:reconnected';
    playerId: string;
    playerName: string;
}

export interface S2C_Error {
    type: 'error';
    code: string;
    message: string;
}

export interface S2C_Pong {
    type: 'pong';
}

export type ServerToClientMessage =
    | S2C_GameCreated
    | S2C_GameJoined
    | S2C_DisplayJoined
    | S2C_StateUpdate
    | S2C_PlayersUpdate
    | S2C_HostChanged
    | S2C_RoundStart
    | S2C_RoundEnd
    | S2C_ResponseReceived
    | S2C_GameEnd
    | S2C_PlayerDisconnected
    | S2C_PlayerReconnected
    | S2C_Error
    | S2C_Pong;

// ============================================
// Error Codes
// ============================================

export const ErrorCodes = {
    GAME_NOT_FOUND: 'GAME_NOT_FOUND',
    GAME_FULL: 'GAME_FULL',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    INVALID_SESSION: 'INVALID_SESSION',
    NOT_HOST: 'NOT_HOST',
    NOT_ENOUGH_PLAYERS: 'NOT_ENOUGH_PLAYERS',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    ALREADY_RESPONDED: 'ALREADY_RESPONDED',
    NAME_TAKEN: 'NAME_TAKEN',
    INVALID_MESSAGE: 'INVALID_MESSAGE',
    GAME_TYPE_NOT_FOUND: 'GAME_TYPE_NOT_FOUND'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
