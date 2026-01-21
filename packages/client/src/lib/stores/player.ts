import { writable, derived } from 'svelte/store';

interface PlayerSession {
    sessionToken: string;
    playerId: string;
    gameCode: string;
}

const STORAGE_KEY = 'game_session';

function loadSession(): PlayerSession | null {
    if (typeof localStorage === 'undefined') return null;
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function saveSession(session: PlayerSession | null): void {
    if (typeof localStorage === 'undefined') return;
    if (session) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const playerSession = writable<PlayerSession | null>(loadSession());

export const isLoggedIn = derived(playerSession, ($session) => $session !== null);
export const currentPlayerId = derived(playerSession, ($session) => $session?.playerId ?? null);
export const currentGameCode = derived(playerSession, ($session) => $session?.gameCode ?? null);

export function setPlayerSession(sessionToken: string, playerId: string, gameCode: string): void {
    const session = { sessionToken, playerId, gameCode };
    saveSession(session);
    playerSession.set(session);
}

export function clearPlayerSession(): void {
    saveSession(null);
    playerSession.set(null);
}

export function getStoredSession(): PlayerSession | null {
    return loadSession();
}
