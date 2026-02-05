import type { WebSocket } from 'ws';
import { nanoid } from 'nanoid';
import type {
    ClientToServerMessage,
    S2C_Error,
    ConnectionInfo
} from '@game/shared';
import {
    ErrorCodes,
    filterStateForDisplay,
    filterStateForPlayer,
    toPlayerPublic
} from '@game/shared';
import { gameManager } from '../game/game-manager.js';
import { sessionStore } from '../session/session-store.js';
import {
    registry,
    send,
    sendToPlayer,
    sendToDisplay,
    broadcastToGame,
    broadcastToPlayers
} from './broadcaster.js';

function sendError(ws: WebSocket, code: string, message: string): void {
    const error: S2C_Error = { type: 'error', code, message };
    send(ws, error);
}

function createConnectionInfo(): ConnectionInfo {
    return {
        id: nanoid(),
        connectedAt: Date.now(),
        lastPing: Date.now()
    };
}

export function handleConnection(ws: WebSocket): void {
    registry.register(ws);

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString()) as ClientToServerMessage;
            handleMessage(ws, message);
        } catch {
            sendError(ws, ErrorCodes.INVALID_MESSAGE, 'Invalid message format');
        }
    });

    ws.on('close', () => {
        handleDisconnect(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function handleMessage(ws: WebSocket, message: ClientToServerMessage): void {
    switch (message.type) {
        case 'game:create':
            handleGameCreate(ws, message.gameType, message.config, message.playerName);
            break;
        case 'game:join':
            handleGameJoin(ws, message.code, message.playerName);
            break;
        case 'game:join-display':
            handleJoinDisplay(ws, message.code);
            break;
        case 'session:reconnect':
            handleReconnect(ws, message.sessionToken, message.code);
            break;
        case 'host:claim':
            handleHostClaim(ws);
            break;
        case 'host:start':
            handleHostStart(ws);
            break;
        case 'host:next-round':
            handleHostNextRound(ws);
            break;
        case 'host:end-game':
            handleHostEndGame(ws);
            break;
        case 'player:response':
            handlePlayerResponse(ws, message.response);
            break;
        case 'player:action':
            handlePlayerAction(ws, message.action);
            break;
        case 'ping':
            send(ws, { type: 'pong' });
            break;
    }
}

function handleGameCreate(
    ws: WebSocket,
    gameType: string,
    config?: Record<string, unknown>,
    playerName?: string
): void {
    const game = gameManager.createGame(gameType, config as any);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_TYPE_NOT_FOUND, 'Game type not found');
        return;
    }

    const code = game.getCode();

    // If playerName is provided, creator joins as player/host instead of display
    if (playerName) {
        const sessionToken = sessionStore.createSession('pending', code);
        const player = game.addPlayer(playerName, sessionToken);
        game.setHost(player.id); // Creator is automatically host

        registry.setPlayer(ws, player.id, code);

        send(ws, {
            type: 'game:created',
            code,
            gameType
        });

        send(ws, {
            type: 'game:joined',
            sessionToken,
            playerId: player.id,
            state: filterStateForPlayer(game.getSession(), player)
        });

        broadcastPlayersUpdate(code);
    } else {
        // Creator becomes the display
        game.setDisplayConnection(createConnectionInfo());
        registry.setDisplay(ws, code);

        send(ws, {
            type: 'game:created',
            code,
            gameType
        });

        // Send initial state
        send(ws, {
            type: 'display:joined',
            state: filterStateForDisplay(game.getSession())
        });
    }
}

function handleGameJoin(ws: WebSocket, code: string, playerName: string): void {
    const game = gameManager.getGame(code);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (!game.canJoin()) {
        if (game.getStatus() !== 'lobby') {
            sendError(ws, ErrorCodes.GAME_ALREADY_STARTED, 'Game already started');
        } else {
            sendError(ws, ErrorCodes.GAME_FULL, 'Game is full');
        }
        return;
    }

    if (game.isNameTaken(playerName)) {
        sendError(ws, ErrorCodes.NAME_TAKEN, 'Name already taken');
        return;
    }

    const sessionToken = sessionStore.createSession('pending', game.getCode());
    const player = game.addPlayer(playerName, sessionToken);

    registry.setPlayer(ws, player.id, game.getCode());

    send(ws, {
        type: 'game:joined',
        sessionToken,
        playerId: player.id,
        state: filterStateForPlayer(game.getSession(), player)
    });

    // Broadcast player update to all
    broadcastPlayersUpdate(game.getCode());
}

function handleJoinDisplay(ws: WebSocket, code: string): void {
    const game = gameManager.getGame(code);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    game.setDisplayConnection(createConnectionInfo());
    registry.setDisplay(ws, code);

    send(ws, {
        type: 'display:joined',
        state: filterStateForDisplay(game.getSession())
    });
}

function handleReconnect(ws: WebSocket, sessionToken: string, code: string): void {
    const game = gameManager.getGame(code);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    const player = game.getPlayerBySessionToken(sessionToken);
    if (!player) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Invalid session');
        return;
    }

    game.playerConnected(player.id, createConnectionInfo());
    registry.setPlayer(ws, player.id, code);

    send(ws, {
        type: 'game:joined',
        sessionToken,
        playerId: player.id,
        state: filterStateForPlayer(game.getSession(), player)
    });

    // Notify others of reconnection
    broadcastToGame(code, {
        type: 'player:reconnected',
        playerId: player.id,
        playerName: player.name
    });

    broadcastPlayersUpdate(code);
}

function handleHostClaim(ws: WebSocket): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (game.getStatus() !== 'lobby') {
        sendError(ws, ErrorCodes.GAME_ALREADY_STARTED, 'Cannot change host after game starts');
        return;
    }

    game.setHost(conn.playerId);
    const player = game.getPlayer(conn.playerId);

    broadcastToGame(conn.gameCode, {
        type: 'host:changed',
        hostId: conn.playerId,
        hostName: player?.name ?? 'Unknown'
    });

    broadcastPlayersUpdate(conn.gameCode);
}

function handleHostStart(ws: WebSocket): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (!game.isHost(conn.playerId)) {
        sendError(ws, ErrorCodes.NOT_HOST, 'Only host can start the game');
        return;
    }

    const { canStart, reason } = game.canStart();
    if (!canStart) {
        sendError(ws, ErrorCodes.NOT_ENOUGH_PLAYERS, reason ?? 'Cannot start');
        return;
    }

    game.startGame();
    startNextRound(game, conn.gameCode);
}

function handleHostNextRound(ws: WebSocket): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (!game.isHost(conn.playerId)) {
        sendError(ws, ErrorCodes.NOT_HOST, 'Only host can advance rounds');
        return;
    }

    const status = game.getStatus();

    // Allow host to end round while in_progress (for host-controlled games)
    if (status === 'in_progress') {
        endCurrentRound(game, conn.gameCode);
        // After ending, check if it was the last round
        if (game.isLastRound()) {
            endGame(game, conn.gameCode);
        }
        return;
    }

    if (status !== 'between_rounds') {
        return;
    }

    if (game.isLastRound()) {
        endGame(game, conn.gameCode);
    } else {
        startNextRound(game, conn.gameCode);
    }
}

function handleHostEndGame(ws: WebSocket): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (!game.isHost(conn.playerId)) {
        sendError(ws, ErrorCodes.NOT_HOST, 'Only host can end the game');
        return;
    }

    endGame(game, conn.gameCode);
}

function handlePlayerResponse(ws: WebSocket, response: unknown): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (game.getStatus() !== 'in_progress') {
        return;
    }

    const result = game.submitResponse(conn.playerId, response);

    if (!result.success) {
        if (result.error === 'Already responded') {
            sendError(ws, ErrorCodes.ALREADY_RESPONDED, result.error);
        } else {
            sendError(ws, ErrorCodes.INVALID_RESPONSE, result.error ?? 'Invalid response');
        }
        return;
    }

    // Notify that response was received
    broadcastToGame(conn.gameCode, {
        type: 'response:received',
        playerId: conn.playerId
    });

    // Broadcast updated state
    broadcastStateUpdate(game, conn.gameCode);

    // If all responses received, end round
    if (result.allReceived) {
        endCurrentRound(game, conn.gameCode);
    }
}

function handlePlayerAction(ws: WebSocket, action: unknown): void {
    const conn = registry.getConnection(ws);
    if (!conn?.playerId || !conn.gameCode) {
        sendError(ws, ErrorCodes.INVALID_SESSION, 'Not in a game');
        return;
    }

    const game = gameManager.getGame(conn.gameCode);
    if (!game) {
        sendError(ws, ErrorCodes.GAME_NOT_FOUND, 'Game not found');
        return;
    }

    if (game.getStatus() !== 'in_progress') {
        return;
    }

    const result = game.handlePlayerAction(conn.playerId, action);

    if (!result.success) {
        sendError(ws, ErrorCodes.INVALID_MESSAGE, result.error ?? 'Invalid action');
        return;
    }

    // Broadcast updated state to all
    broadcastStateUpdate(game, conn.gameCode);
}

function handleDisconnect(ws: WebSocket): void {
    const conn = registry.unregister(ws);
    if (!conn) return;

    if (conn.isDisplay && conn.gameCode) {
        const game = gameManager.getGame(conn.gameCode);
        if (game) {
            game.clearDisplayConnection();
        }
        return;
    }

    if (conn.playerId && conn.gameCode) {
        const game = gameManager.getGame(conn.gameCode);
        if (!game) return;

        game.playerDisconnected(conn.playerId, () => {
            // Grace period expired
            const newHost = game.transferHostIfNeeded();
            if (newHost) {
                broadcastToGame(conn.gameCode!, {
                    type: 'host:changed',
                    hostId: newHost.id,
                    hostName: newHost.name
                });
            }
            broadcastPlayersUpdate(conn.gameCode!);
        });

        const player = game.getPlayer(conn.playerId);
        if (player) {
            broadcastToGame(conn.gameCode, {
                type: 'player:disconnected',
                playerId: conn.playerId,
                playerName: player.name
            });
        }

        broadcastPlayersUpdate(conn.gameCode);
    }
}

// Helper functions
function startNextRound(game: ReturnType<typeof gameManager.getGame>, gameCode: string): void {
    if (!game) return;

    const round = game.startRound();

    broadcastToGame(gameCode, {
        type: 'round:start',
        round: {
            roundNumber: round.roundNumber,
            data: round.roundData,
            timeLimit: round.timeLimit,
            startedAt: Date.now()
        }
    });

    broadcastStateUpdate(game, gameCode);
}

function endCurrentRound(game: ReturnType<typeof gameManager.getGame>, gameCode: string): void {
    if (!game) return;

    const { results, scoreChanges } = game.endRound();

    broadcastToGame(gameCode, {
        type: 'round:end',
        results: {
            roundNumber: game.getSession().currentRound,
            results,
            scores: Object.fromEntries(
                game.getAllPlayers().map(p => [p.id, p.score])
            ),
            scoreChanges
        }
    });

    broadcastStateUpdate(game, gameCode);
}

function endGame(game: ReturnType<typeof gameManager.getGame>, gameCode: string): void {
    if (!game) return;

    const { results, rankings } = game.endGame();

    broadcastToGame(gameCode, {
        type: 'game:end',
        results: {
            rankings,
            gameData: results
        }
    });

    broadcastStateUpdate(game, gameCode);
}

function broadcastPlayersUpdate(gameCode: string): void {
    const game = gameManager.getGame(gameCode);
    if (!game) return;

    const players = game.getAllPlayers().map(toPlayerPublic);

    broadcastToGame(gameCode, {
        type: 'players:update',
        players,
        hostId: game.getSession().hostId
    });
}

function broadcastStateUpdate(game: ReturnType<typeof gameManager.getGame>, gameCode: string): void {
    if (!game) return;

    const session = game.getSession();

    // Send to display
    sendToDisplay(gameCode, {
        type: 'state:update',
        state: filterStateForDisplay(session),
        isDisplay: true
    });

    // Send to each player with their private state
    for (const player of game.getAllPlayers()) {
        if (player.connectionStatus === 'connected') {
            sendToPlayer(player.id, gameCode, {
                type: 'state:update',
                state: filterStateForPlayer(session, player),
                isDisplay: false
            });
        }
    }
}
