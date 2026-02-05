import { nanoid } from 'nanoid';
import type {
    GameSession,
    GameConfig,
    GameStatus,
    Player,
    ConnectionInfo
} from '@game/shared';
import { generateJoinCode } from '@game/shared';
import type { AnyGamePlugin, PlayerResponse } from '../plugins/plugin-interface.js';

const RECONNECT_GRACE_PERIOD = 30000; // 30 seconds

export class GameSessionManager {
    private session: GameSession;
    private plugin: AnyGamePlugin;
    private responses: Map<string, PlayerResponse> = new Map();
    private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();
    private roundTimer: NodeJS.Timeout | null = null;

    constructor(plugin: AnyGamePlugin, config?: Partial<GameConfig>) {
        const code = generateJoinCode();

        this.plugin = plugin;
        this.session = {
            id: nanoid(),
            code,
            status: 'lobby',
            gameType: plugin.id,
            displayConnection: null,
            players: new Map(),
            hostId: null,
            currentRound: 0,
            totalRounds: config?.totalRounds ?? plugin.defaultRounds,
            roundStartedAt: null,
            roundTimeLimit: null,
            hiddenState: null,
            publicState: null,
            playerPrivateState: new Map(),
            config: {
                minPlayers: plugin.minPlayers,
                maxPlayers: plugin.maxPlayers,
                totalRounds: config?.totalRounds ?? plugin.defaultRounds,
                roundTimeLimit: config?.roundTimeLimit,
                customConfig: config?.customConfig
            },
            createdAt: Date.now()
        };
    }

    getSession(): GameSession {
        return this.session;
    }

    getCode(): string {
        return this.session.code;
    }

    getStatus(): GameStatus {
        return this.session.status;
    }

    getPlugin(): AnyGamePlugin {
        return this.plugin;
    }

    // Display management
    setDisplayConnection(connectionInfo: ConnectionInfo): void {
        this.session.displayConnection = connectionInfo;
    }

    clearDisplayConnection(): void {
        this.session.displayConnection = null;
    }

    hasDisplay(): boolean {
        return this.session.displayConnection !== null;
    }

    // Player management
    addPlayer(name: string, sessionToken: string): Player {
        const id = nanoid(8);
        const now = Date.now();

        const player: Player = {
            id,
            name,
            sessionToken,
            connectionStatus: 'connected',
            connectionInfo: {
                id: nanoid(),
                connectedAt: now,
                lastPing: now
            },
            isHost: false,
            score: 0,
            joinedAt: now,
            disconnectedAt: null
        };

        this.session.players.set(id, player);

        // First player becomes host
        if (this.session.hostId === null) {
            this.setHost(id);
        }

        return player;
    }

    getPlayer(playerId: string): Player | undefined {
        return this.session.players.get(playerId);
    }

    getPlayerByName(name: string): Player | undefined {
        for (const player of this.session.players.values()) {
            if (player.name.toLowerCase() === name.toLowerCase()) {
                return player;
            }
        }
        return undefined;
    }

    getPlayerBySessionToken(token: string): Player | undefined {
        for (const player of this.session.players.values()) {
            if (player.sessionToken === token) {
                return player;
            }
        }
        return undefined;
    }

    getAllPlayers(): Player[] {
        return Array.from(this.session.players.values());
    }

    getConnectedPlayers(): Player[] {
        return this.getAllPlayers().filter(p => p.connectionStatus === 'connected');
    }

    getPlayerCount(): number {
        return this.session.players.size;
    }

    isNameTaken(name: string): boolean {
        return this.getPlayerByName(name) !== undefined;
    }

    canJoin(): boolean {
        return (
            this.session.status === 'lobby' &&
            this.session.players.size < this.session.config.maxPlayers
        );
    }

    // Host management
    setHost(playerId: string): boolean {
        const player = this.session.players.get(playerId);
        if (!player) return false;

        // Remove host from current host
        if (this.session.hostId) {
            const currentHost = this.session.players.get(this.session.hostId);
            if (currentHost) {
                currentHost.isHost = false;
            }
        }

        player.isHost = true;
        this.session.hostId = playerId;
        return true;
    }

    getHost(): Player | undefined {
        if (!this.session.hostId) return undefined;
        return this.session.players.get(this.session.hostId);
    }

    isHost(playerId: string): boolean {
        return this.session.hostId === playerId;
    }

    // Connection management
    playerConnected(playerId: string, connectionInfo: ConnectionInfo): void {
        const player = this.session.players.get(playerId);
        if (!player) return;

        player.connectionStatus = 'connected';
        player.connectionInfo = connectionInfo;
        player.disconnectedAt = null;

        // Clear disconnect timer
        const timer = this.disconnectTimers.get(playerId);
        if (timer) {
            clearTimeout(timer);
            this.disconnectTimers.delete(playerId);
        }
    }

    playerDisconnected(playerId: string, onGracePeriodExpired: () => void): void {
        const player = this.session.players.get(playerId);
        if (!player) return;

        player.connectionStatus = 'disconnected';
        player.connectionInfo = null;
        player.disconnectedAt = Date.now();

        // Start grace period timer
        const timer = setTimeout(() => {
            this.disconnectTimers.delete(playerId);
            onGracePeriodExpired();
        }, RECONNECT_GRACE_PERIOD);

        this.disconnectTimers.set(playerId, timer);
    }

    transferHostIfNeeded(): Player | null {
        const host = this.getHost();
        if (host && host.connectionStatus === 'connected') {
            return null;
        }

        // Find first connected player
        const newHost = this.getConnectedPlayers()[0];
        if (newHost) {
            this.setHost(newHost.id);
            return newHost;
        }

        return null;
    }

    // Game flow
    canStart(): { canStart: boolean; reason?: string } {
        if (this.session.status !== 'lobby') {
            return { canStart: false, reason: 'Game already started' };
        }

        const playerCount = this.getConnectedPlayers().length;
        if (playerCount < this.session.config.minPlayers) {
            return {
                canStart: false,
                reason: `Need at least ${this.session.config.minPlayers} players`
            };
        }

        return { canStart: true };
    }

    startGame(): void {
        const playerIds = this.getAllPlayers().map(p => p.id);
        const { hidden, public: publicState, playerPrivate } =
            this.plugin.createInitialState(playerIds, this.session.config);

        this.session.hiddenState = hidden;
        this.session.publicState = publicState;
        this.session.playerPrivateState = playerPrivate;
        this.session.status = 'in_progress';
        this.session.currentRound = 0;
    }

    startRound(): {
        roundNumber: number;
        roundData: unknown;
        timeLimit: number | null;
        playerPrivateData?: Map<string, unknown>;
    } {
        this.session.currentRound++;
        this.responses.clear();

        const roundStart = this.plugin.onRoundStart(
            this.session.currentRound,
            this.session
        );

        this.session.hiddenState = roundStart.hiddenData;
        this.session.roundStartedAt = Date.now();
        this.session.roundTimeLimit = roundStart.timeLimit ?? null;
        this.session.status = 'in_progress';

        if (roundStart.playerPrivateData) {
            this.session.playerPrivateState = roundStart.playerPrivateData;
        }

        return {
            roundNumber: this.session.currentRound,
            roundData: roundStart.roundData,
            timeLimit: roundStart.timeLimit ?? null,
            playerPrivateData: roundStart.playerPrivateData
        };
    }

    submitResponse(
        playerId: string,
        response: unknown
    ): { success: boolean; error?: string; allReceived: boolean } {
        // Check if already responded - allow overwrite if mutableResponses is enabled
        if (this.responses.has(playerId) && !this.plugin.mutableResponses) {
            return { success: false, error: 'Already responded', allReceived: false };
        }

        const validation = this.plugin.validateResponse(playerId, response, this.session);
        if (!validation.valid) {
            return { success: false, error: validation.error, allReceived: false };
        }

        this.responses.set(playerId, {
            playerId,
            response,
            receivedAt: Date.now()
        });

        // Update state after response
        const stateUpdate = this.plugin.onResponseReceived(playerId, response, this.session);
        this.session.hiddenState = stateUpdate.hidden;
        this.session.publicState = stateUpdate.public;
        if (stateUpdate.playerPrivate) {
            this.session.playerPrivateState = stateUpdate.playerPrivate;
        }

        // Never auto-end if hostControlledRounds is enabled
        const allReceived = !this.plugin.hostControlledRounds &&
            this.responses.size >= this.getConnectedPlayers().length;
        return { success: true, allReceived };
    }

    hasResponded(playerId: string): boolean {
        return this.responses.has(playerId);
    }

    handlePlayerAction(
        playerId: string,
        action: unknown
    ): { success: boolean; error?: string } {
        if (!this.plugin.onPlayerAction) {
            return { success: false, error: 'Plugin does not support player actions' };
        }

        const stateUpdate = this.plugin.onPlayerAction(playerId, action, this.session);
        this.session.hiddenState = stateUpdate.hidden;
        this.session.publicState = stateUpdate.public;
        if (stateUpdate.playerPrivate) {
            this.session.playerPrivateState = stateUpdate.playerPrivate;
        }

        return { success: true };
    }

    getResponses(): PlayerResponse[] {
        return Array.from(this.responses.values());
    }

    endRound(): {
        results: unknown;
        scoreChanges: Record<string, number>;
    } {
        const responses = this.getResponses();
        const { results, hidden, public: publicState, playerPrivate } =
            this.plugin.onAllResponsesReceived(responses, this.session);

        this.session.hiddenState = hidden;
        this.session.publicState = publicState;
        if (playerPrivate) {
            this.session.playerPrivateState = playerPrivate;
        }

        // Calculate scores
        const currentScores = new Map<string, number>();
        for (const player of this.session.players.values()) {
            currentScores.set(player.id, player.score);
        }

        const newScores = this.plugin.calculateScores(results, currentScores, this.session);
        const scoreChanges: Record<string, number> = {};

        for (const [playerId, newScore] of newScores) {
            const player = this.session.players.get(playerId);
            if (player) {
                scoreChanges[playerId] = newScore - player.score;
                player.score = newScore;
            }
        }

        this.session.status = 'between_rounds';
        this.session.roundStartedAt = null;
        this.session.roundTimeLimit = null;

        return { results, scoreChanges };
    }

    isLastRound(): boolean {
        return this.session.currentRound >= this.session.totalRounds;
    }

    endGame(): {
        results: unknown;
        rankings: Array<{ playerId: string; playerName: string; score: number; rank: number }>;
    } {
        this.session.status = 'ended';

        const gameResults = this.plugin.onGameEnd(this.session);

        // Calculate rankings
        const players = this.getAllPlayers()
            .sort((a, b) => b.score - a.score);

        const rankings = players.map((player, index) => ({
            playerId: player.id,
            playerName: player.name,
            score: player.score,
            rank: index + 1
        }));

        return { results: gameResults, rankings };
    }

    resetForNewGame(): void {
        // Reset scores
        for (const player of this.session.players.values()) {
            player.score = 0;
        }

        // Reset game state
        this.session.status = 'lobby';
        this.session.currentRound = 0;
        this.session.roundStartedAt = null;
        this.session.roundTimeLimit = null;
        this.session.hiddenState = null;
        this.session.publicState = null;
        this.session.playerPrivateState = new Map();
        this.responses.clear();
    }

    // Cleanup
    cleanup(): void {
        for (const timer of this.disconnectTimers.values()) {
            clearTimeout(timer);
        }
        this.disconnectTimers.clear();

        if (this.roundTimer) {
            clearTimeout(this.roundTimer);
            this.roundTimer = null;
        }
    }
}
