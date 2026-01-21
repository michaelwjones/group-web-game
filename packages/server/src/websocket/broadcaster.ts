import type { WebSocket } from 'ws';
import type { ServerToClientMessage } from '@game/shared';

interface ClientConnection {
    ws: WebSocket;
    playerId: string | null;
    gameCode: string | null;
    isDisplay: boolean;
}

class ConnectionRegistry {
    private connections = new Map<WebSocket, ClientConnection>();
    private playerConnections = new Map<string, WebSocket>();
    private displayConnections = new Map<string, WebSocket>();

    register(ws: WebSocket): void {
        this.connections.set(ws, {
            ws,
            playerId: null,
            gameCode: null,
            isDisplay: false
        });
    }

    unregister(ws: WebSocket): ClientConnection | undefined {
        const conn = this.connections.get(ws);
        if (conn) {
            if (conn.playerId && conn.gameCode) {
                this.playerConnections.delete(`${conn.gameCode}:${conn.playerId}`);
            }
            if (conn.isDisplay && conn.gameCode) {
                this.displayConnections.delete(conn.gameCode);
            }
            this.connections.delete(ws);
        }
        return conn;
    }

    setPlayer(ws: WebSocket, playerId: string, gameCode: string): void {
        const conn = this.connections.get(ws);
        if (conn) {
            conn.playerId = playerId;
            conn.gameCode = gameCode;
            conn.isDisplay = false;
            this.playerConnections.set(`${gameCode}:${playerId}`, ws);
        }
    }

    setDisplay(ws: WebSocket, gameCode: string): void {
        const conn = this.connections.get(ws);
        if (conn) {
            conn.gameCode = gameCode;
            conn.isDisplay = true;
            this.displayConnections.set(gameCode, ws);
        }
    }

    getConnection(ws: WebSocket): ClientConnection | undefined {
        return this.connections.get(ws);
    }

    getPlayerSocket(playerId: string, gameCode: string): WebSocket | undefined {
        return this.playerConnections.get(`${gameCode}:${playerId}`);
    }

    getDisplaySocket(gameCode: string): WebSocket | undefined {
        return this.displayConnections.get(gameCode);
    }

    getAllPlayersInGame(gameCode: string): WebSocket[] {
        const sockets: WebSocket[] = [];
        for (const [key, ws] of this.playerConnections) {
            if (key.startsWith(`${gameCode}:`)) {
                sockets.push(ws);
            }
        }
        return sockets;
    }

    getAllInGame(gameCode: string): WebSocket[] {
        const sockets = this.getAllPlayersInGame(gameCode);
        const display = this.displayConnections.get(gameCode);
        if (display) {
            sockets.push(display);
        }
        return sockets;
    }
}

export const registry = new ConnectionRegistry();

export function send(ws: WebSocket, message: ServerToClientMessage): void {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

export function sendToPlayer(
    playerId: string,
    gameCode: string,
    message: ServerToClientMessage
): void {
    const ws = registry.getPlayerSocket(playerId, gameCode);
    if (ws) {
        send(ws, message);
    }
}

export function sendToDisplay(gameCode: string, message: ServerToClientMessage): void {
    const ws = registry.getDisplaySocket(gameCode);
    if (ws) {
        send(ws, message);
    }
}

export function broadcastToGame(gameCode: string, message: ServerToClientMessage): void {
    const sockets = registry.getAllInGame(gameCode);
    const data = JSON.stringify(message);
    for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    }
}

export function broadcastToPlayers(gameCode: string, message: ServerToClientMessage): void {
    const sockets = registry.getAllPlayersInGame(gameCode);
    const data = JSON.stringify(message);
    for (const ws of sockets) {
        if (ws.readyState === ws.OPEN) {
            ws.send(data);
        }
    }
}
