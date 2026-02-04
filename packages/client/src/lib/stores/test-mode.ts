/**
 * Test Mode Store
 *
 * Supports the test harness (test/harness.html) by enabling URL parameter-driven
 * automation of game creation and joining. When testMode=true, the client will:
 * - Auto-create or auto-join games based on URL parameters
 * - Use isolated localStorage keys (prefixed with testClientId)
 * - Post messages to parent window for harness orchestration
 * - Hide the connection status banner for cleaner UI
 *
 * See test/README.md for full documentation.
 */

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

interface TestModeParams {
    testMode: boolean;
    testClientId: string | null;
    autoCreate: boolean;
    autoJoin: boolean;
    gameType: string | null;
    asDisplay: boolean;
    playerName: string | null;
}

const defaultParams: TestModeParams = {
    testMode: false,
    testClientId: null,
    autoCreate: false,
    autoJoin: false,
    gameType: null,
    asDisplay: false,
    playerName: null
};

export const testModeParams = writable<TestModeParams>({ ...defaultParams });

export const isTestMode = derived(testModeParams, ($params) => $params.testMode);
export const testClientId = derived(testModeParams, ($params) => $params.testClientId);

/**
 * Parse URL parameters for test mode functionality.
 * Call this in onMount of pages that need to respond to test mode.
 */
export function parseTestModeParams(): TestModeParams {
    if (!browser) return { ...defaultParams };

    const url = new URL(window.location.href);
    const params: TestModeParams = {
        testMode: url.searchParams.get('testMode') === 'true',
        testClientId: url.searchParams.get('testClientId'),
        autoCreate: url.searchParams.get('autoCreate') === 'true',
        autoJoin: url.searchParams.get('autoJoin') === 'true',
        gameType: url.searchParams.get('gameType'),
        asDisplay: url.searchParams.get('asDisplay') === 'true',
        playerName: url.searchParams.get('playerName')
    };

    testModeParams.set(params);
    return params;
}

/**
 * Get the current test client ID (for session isolation).
 */
export function getTestClientId(): string | null {
    return get(testModeParams).testClientId;
}

/**
 * Check if currently in test mode.
 */
export function getIsTestMode(): boolean {
    return get(testModeParams).testMode;
}

// postMessage types for iframe communication
export interface TestMessage {
    type: 'GAME_CREATED' | 'JOINED' | 'ERROR';
    code?: string;
    clientId?: string;
    message?: string;
}

/**
 * Send a message to the parent window (for iframe communication in test mode).
 */
export function postToParent(message: TestMessage): void {
    if (!browser) return;
    if (!get(testModeParams).testMode) return;
    if (window.parent === window) return;

    window.parent.postMessage(message, '*');
}
