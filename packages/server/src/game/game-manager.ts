import type { GameConfig } from '@game/shared';
import { normalizeJoinCode } from '@game/shared';
import { GameSessionManager } from './game-session.js';
import type { AnyGamePlugin } from '../plugins/plugin-interface.js';

export class GameManager {
    private games = new Map<string, GameSessionManager>();
    private plugins = new Map<string, AnyGamePlugin>();

    registerPlugin(plugin: AnyGamePlugin): void {
        this.plugins.set(plugin.id, plugin);
        console.log(`Registered game plugin: ${plugin.name} (${plugin.id})`);
    }

    getPlugin(id: string): AnyGamePlugin | undefined {
        return this.plugins.get(id);
    }

    getAvailablePlugins(): AnyGamePlugin[] {
        return Array.from(this.plugins.values());
    }

    createGame(gameType: string, config?: Partial<GameConfig>): GameSessionManager | null {
        const plugin = this.plugins.get(gameType);
        if (!plugin) {
            return null;
        }

        const session = new GameSessionManager(plugin, config);
        const code = session.getCode();

        // Ensure unique code
        if (this.games.has(code)) {
            // Extremely rare collision, just try again
            return this.createGame(gameType, config);
        }

        this.games.set(code, session);
        console.log(`Created game: ${code} (${gameType})`);

        return session;
    }

    getGame(code: string): GameSessionManager | undefined {
        return this.games.get(normalizeJoinCode(code));
    }

    deleteGame(code: string): void {
        const game = this.games.get(code);
        if (game) {
            game.cleanup();
            this.games.delete(code);
            console.log(`Deleted game: ${code}`);
        }
    }

    getActiveGameCount(): number {
        return this.games.size;
    }

    // Cleanup stale games
    cleanupStaleGames(maxIdleTime: number = 60 * 60 * 1000): void {
        const now = Date.now();
        for (const [code, game] of this.games) {
            const session = game.getSession();

            // Delete games that have ended and are old
            if (session.status === 'ended') {
                const lastActivity = session.roundStartedAt ?? session.createdAt;
                if (now - lastActivity > maxIdleTime) {
                    this.deleteGame(code);
                }
            }

            // Delete lobby games with no players for too long
            if (session.status === 'lobby' && game.getPlayerCount() === 0) {
                if (now - session.createdAt > maxIdleTime) {
                    this.deleteGame(code);
                }
            }
        }
    }
}

export const gameManager = new GameManager();
