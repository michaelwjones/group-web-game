// Re-export connection state from websocket client
export {
    connectionState,
    connectionStatus,
    lastError,
    type ConnectionState,
    type ConnectionStatus
} from '../websocket/client.js';

import { derived } from 'svelte/store';
import { connectionState } from '../websocket/client.js';

export const isConnected = derived(connectionState, ($state) => $state === 'connected');
export const isReconnecting = derived(connectionState, ($state) => $state === 'reconnecting');
