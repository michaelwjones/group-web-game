import { writable, derived } from 'svelte/store';

interface PlayerSession {
    sessionToken: string;
    playerId: string;
    gameCode: string;
}

const BASE_STORAGE_KEY = 'game_session';

/**
 * Get the storage key for the current session.
 * Parses testClientId directly from URL to work at module load time
 * (before the test-mode store is initialized).
 */
function getStorageKey(): string {
    if (typeof window === 'undefined') return BASE_STORAGE_KEY;
    try {
        const url = new URL(window.location.href);
        const testClientId = url.searchParams.get('testClientId');
        return testClientId ? `${BASE_STORAGE_KEY}_${testClientId}` : BASE_STORAGE_KEY;
    } catch {
        return BASE_STORAGE_KEY;
    }
}

function loadSession(): PlayerSession | null {
    if (typeof localStorage === 'undefined') return null;
    try {
        const data = localStorage.getItem(getStorageKey());
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function saveSession(session: PlayerSession | null): void {
    if (typeof localStorage === 'undefined') return;
    const key = getStorageKey();
    if (session) {
        localStorage.setItem(key, JSON.stringify(session));
    } else {
        localStorage.removeItem(key);
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
