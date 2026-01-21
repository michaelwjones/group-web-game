export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface ConnectionInfo {
    id: string;
    connectedAt: number;
    lastPing: number;
}

export interface Player {
    id: string;
    name: string;
    sessionToken: string;
    connectionStatus: ConnectionStatus;
    connectionInfo: ConnectionInfo | null;
    isHost: boolean;
    score: number;
    joinedAt: number;
    disconnectedAt: number | null;
}

export interface PlayerPublic {
    id: string;
    name: string;
    connectionStatus: ConnectionStatus;
    isHost: boolean;
    score: number;
}

export function toPlayerPublic(player: Player): PlayerPublic {
    return {
        id: player.id,
        name: player.name,
        connectionStatus: player.connectionStatus,
        isHost: player.isHost,
        score: player.score
    };
}
