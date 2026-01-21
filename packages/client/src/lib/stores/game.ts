import { writable, derived, get } from 'svelte/store';
import type {
    GameStateForDisplay,
    GameStateForPlayer,
    PlayerPublic,
    RoundData,
    RoundResults,
    FinalResults,
    ServerToClientMessage
} from '@game/shared';
import {
    initializeClient,
    send,
    lastError,
    type WebSocketClient
} from '../websocket/client.js';
import { setPlayerSession, clearPlayerSession, getStoredSession } from './player.js';

type ViewMode = 'home' | 'display' | 'player';

interface GameStore {
    viewMode: ViewMode;
    gameCode: string | null;
    isDisplay: boolean;
    displayState: GameStateForDisplay | null;
    playerState: GameStateForPlayer | null;
    currentRound: RoundData | null;
    roundResults: RoundResults | null;
    finalResults: FinalResults | null;
    hasResponded: boolean;
    respondedPlayers: Set<string>;
}

const initialState: GameStore = {
    viewMode: 'home',
    gameCode: null,
    isDisplay: false,
    displayState: null,
    playerState: null,
    currentRound: null,
    roundResults: null,
    finalResults: null,
    hasResponded: false,
    respondedPlayers: new Set()
};

export const gameStore = writable<GameStore>({ ...initialState });

// Derived stores
export const players = derived(gameStore, ($store) => {
    if ($store.displayState) return $store.displayState.players;
    if ($store.playerState) return $store.playerState.players;
    return [];
});

export const gameStatus = derived(gameStore, ($store) => {
    if ($store.displayState) return $store.displayState.status;
    if ($store.playerState) return $store.playerState.status;
    return 'lobby';
});

export const isHost = derived(gameStore, ($store) => {
    return $store.playerState?.isHost ?? false;
});

export const selfId = derived(gameStore, ($store) => {
    return $store.playerState?.selfId ?? null;
});

export const publicState = derived(gameStore, ($store) => {
    if ($store.displayState) return $store.displayState.publicState;
    if ($store.playerState) return $store.playerState.publicState;
    return null;
});

export const privateState = derived(gameStore, ($store) => {
    return $store.playerState?.privateState ?? null;
});

// WebSocket client
let client: WebSocketClient | null = null;

function handleMessage(message: ServerToClientMessage): void {
    switch (message.type) {
        case 'game:created':
            gameStore.update((s) => ({
                ...s,
                gameCode: message.code,
                viewMode: 'display',
                isDisplay: true
            }));
            break;

        case 'game:joined':
            setPlayerSession(message.sessionToken, message.playerId, message.state.code);
            client?.setReconnectData(message.sessionToken, message.state.code);
            gameStore.update((s) => ({
                ...s,
                gameCode: message.state.code,
                viewMode: 'player',
                isDisplay: false,
                playerState: message.state as GameStateForPlayer
            }));
            break;

        case 'display:joined':
            gameStore.update((s) => ({
                ...s,
                gameCode: message.state.code,
                viewMode: 'display',
                isDisplay: true,
                displayState: message.state as GameStateForDisplay
            }));
            break;

        case 'state:update':
            gameStore.update((s) => {
                if (message.isDisplay) {
                    return { ...s, displayState: message.state as GameStateForDisplay };
                } else {
                    return { ...s, playerState: message.state as GameStateForPlayer };
                }
            });
            break;

        case 'players:update':
            gameStore.update((s) => {
                if (s.displayState) {
                    return {
                        ...s,
                        displayState: { ...s.displayState, players: message.players, hostId: message.hostId }
                    };
                }
                if (s.playerState) {
                    return {
                        ...s,
                        playerState: {
                            ...s.playerState,
                            players: message.players,
                            hostId: message.hostId,
                            isHost: message.hostId === s.playerState.selfId
                        }
                    };
                }
                return s;
            });
            break;

        case 'host:changed':
            gameStore.update((s) => {
                if (s.playerState) {
                    return {
                        ...s,
                        playerState: {
                            ...s.playerState,
                            hostId: message.hostId,
                            isHost: message.hostId === s.playerState.selfId
                        }
                    };
                }
                if (s.displayState) {
                    return {
                        ...s,
                        displayState: { ...s.displayState, hostId: message.hostId }
                    };
                }
                return s;
            });
            break;

        case 'round:start':
            gameStore.update((s) => ({
                ...s,
                currentRound: message.round,
                roundResults: null,
                hasResponded: false,
                respondedPlayers: new Set()
            }));
            break;

        case 'round:end':
            gameStore.update((s) => ({
                ...s,
                currentRound: null,
                roundResults: message.results
            }));
            break;

        case 'response:received':
            gameStore.update((s) => {
                const newResponded = new Set(s.respondedPlayers);
                newResponded.add(message.playerId);
                return { ...s, respondedPlayers: newResponded };
            });
            break;

        case 'game:end':
            gameStore.update((s) => ({
                ...s,
                finalResults: message.results,
                currentRound: null,
                roundResults: null
            }));
            break;

        case 'player:disconnected':
        case 'player:reconnected':
            // Handled by players:update
            break;

        case 'error':
            lastError.set({ code: message.code, message: message.message });
            break;

        case 'pong':
            // Heartbeat response
            break;
    }
}

export function initializeGame(): void {
    client = initializeClient(handleMessage);
    client.connect();

    // Check for existing session
    const session = getStoredSession();
    if (session) {
        client.setReconnectData(session.sessionToken, session.gameCode);
    }
}

export function createGame(gameType: string): void {
    lastError.set(null);
    send({ type: 'game:create', gameType });
}

export function joinGame(code: string, playerName: string): void {
    lastError.set(null);
    send({ type: 'game:join', code: code.toUpperCase(), playerName });
}

export function joinAsDisplay(code: string): void {
    lastError.set(null);
    send({ type: 'game:join-display', code: code.toUpperCase() });
}

export function claimHost(): void {
    send({ type: 'host:claim' });
}

export function startGame(): void {
    send({ type: 'host:start' });
}

export function nextRound(): void {
    send({ type: 'host:next-round' });
}

export function endGame(): void {
    send({ type: 'host:end-game' });
}

export function submitResponse(response: unknown): void {
    send({ type: 'player:response', response });
    gameStore.update((s) => ({ ...s, hasResponded: true }));
}

export function leaveGame(): void {
    clearPlayerSession();
    client?.clearReconnectData();
    client?.disconnect();
    gameStore.set({ ...initialState });
    // Reconnect for fresh state
    setTimeout(() => {
        client?.connect();
    }, 100);
}

export function playAgain(): void {
    gameStore.update((s) => ({
        ...s,
        currentRound: null,
        roundResults: null,
        finalResults: null,
        hasResponded: false,
        respondedPlayers: new Set()
    }));
    // Reset handled by server when host starts again
}
