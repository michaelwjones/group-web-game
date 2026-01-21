import type { ClientToServerMessage, ServerToClientMessage } from '@game/shared';
import { writable, get } from 'svelte/store';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

export interface ConnectionStatus {
    state: ConnectionState;
    isInitialConnection: boolean;
    attemptCount: number;
    lastAttemptAt: number | null;
}

interface WebSocketClientOptions {
    url: string;
    onMessage: (message: ServerToClientMessage) => void;
    onConnectionChange: (state: ConnectionState) => void;
}

const INITIAL_RETRY_DELAY = 1000;  // Start at 1s for cold starts
const MAX_RETRY_DELAY = 8000;      // Max 8s between retries
const PING_INTERVAL = 25000;
const COLD_START_TIMEOUT = 45000;  // Consider cold start for first 45s

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private url: string;
    private onMessage: (message: ServerToClientMessage) => void;
    private onConnectionChange: (state: ConnectionState) => void;
    private retryDelay = INITIAL_RETRY_DELAY;
    private retryTimeout: ReturnType<typeof setTimeout> | null = null;
    private pingInterval: ReturnType<typeof setInterval> | null = null;
    private shouldReconnect = false;
    private reconnectData: { sessionToken: string; code: string } | null = null;
    private hasConnectedOnce = false;
    private attemptCount = 0;
    private firstAttemptAt: number | null = null;

    constructor(options: WebSocketClientOptions) {
        this.url = options.url;
        this.onMessage = options.onMessage;
        this.onConnectionChange = options.onConnectionChange;
    }

    getStatus(): ConnectionStatus {
        return {
            state: this.ws?.readyState === WebSocket.OPEN ? 'connected' :
                   this.shouldReconnect ? (this.hasConnectedOnce ? 'reconnecting' : 'connecting') : 'disconnected',
            isInitialConnection: !this.hasConnectedOnce,
            attemptCount: this.attemptCount,
            lastAttemptAt: this.firstAttemptAt
        };
    }

    isInColdStart(): boolean {
        if (this.hasConnectedOnce) return false;
        if (!this.firstAttemptAt) return false;
        return Date.now() - this.firstAttemptAt < COLD_START_TIMEOUT;
    }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        this.shouldReconnect = true;
        this.attemptCount++;

        if (!this.firstAttemptAt) {
            this.firstAttemptAt = Date.now();
        }

        this.onConnectionChange(this.hasConnectedOnce ? 'reconnecting' : 'connecting');

        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = () => {
                this.retryDelay = INITIAL_RETRY_DELAY;
                this.hasConnectedOnce = true;
                this.attemptCount = 0;
                this.onConnectionChange('connected');
                this.startPing();

                // If we have reconnect data, send reconnect message
                if (this.reconnectData) {
                    this.send({
                        type: 'session:reconnect',
                        sessionToken: this.reconnectData.sessionToken,
                        code: this.reconnectData.code
                    });
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data) as ServerToClientMessage;
                    this.onMessage(message);
                } catch (e) {
                    console.error('Failed to parse message:', e);
                }
            };

            this.ws.onclose = () => {
                this.stopPing();
                if (this.shouldReconnect) {
                    this.onConnectionChange('reconnecting');
                    this.scheduleReconnect();
                } else {
                    this.onConnectionChange('disconnected');
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (e) {
            console.error('Failed to create WebSocket:', e);
            this.scheduleReconnect();
        }
    }

    disconnect(): void {
        this.shouldReconnect = false;
        this.reconnectData = null;
        this.stopPing();

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.onConnectionChange('disconnected');
    }

    send(message: ClientToServerMessage): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    setReconnectData(sessionToken: string, code: string): void {
        this.reconnectData = { sessionToken, code };
    }

    clearReconnectData(): void {
        this.reconnectData = null;
    }

    private scheduleReconnect(): void {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }

        this.retryTimeout = setTimeout(() => {
            this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_DELAY);
            this.connect();
        }, this.retryDelay);
    }

    private startPing(): void {
        this.stopPing();
        this.pingInterval = setInterval(() => {
            this.send({ type: 'ping' });
        }, PING_INTERVAL);
    }

    private stopPing(): void {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }
}

// Singleton instance
let client: WebSocketClient | null = null;

export const connectionState = writable<ConnectionState>('disconnected');
export const connectionStatus = writable<ConnectionStatus>({
    state: 'disconnected',
    isInitialConnection: true,
    attemptCount: 0,
    lastAttemptAt: null
});
export const lastError = writable<{ code: string; message: string } | null>(null);

export function getClient(): WebSocketClient | null {
    return client;
}

export function updateConnectionStatus(): void {
    if (client) {
        connectionStatus.set(client.getStatus());
    }
}

export function initializeClient(
    onMessage: (message: ServerToClientMessage) => void
): WebSocketClient {
    if (client) {
        client.disconnect();
    }

    const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001/ws';

    client = new WebSocketClient({
        url: wsUrl,
        onMessage,
        onConnectionChange: (state) => {
            connectionState.set(state);
            updateConnectionStatus();
        }
    });

    return client;
}

export function send(message: ClientToServerMessage): void {
    client?.send(message);
}
