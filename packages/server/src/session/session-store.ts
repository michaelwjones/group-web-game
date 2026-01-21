import { nanoid } from 'nanoid';

interface SessionData {
    token: string;
    playerId: string;
    gameCode: string;
    createdAt: number;
}

export class SessionStore {
    private sessions = new Map<string, SessionData>();
    private playerToSession = new Map<string, string>();

    createSession(playerId: string, gameCode: string): string {
        const token = nanoid(32);
        const session: SessionData = {
            token,
            playerId,
            gameCode,
            createdAt: Date.now()
        };

        this.sessions.set(token, session);
        this.playerToSession.set(`${gameCode}:${playerId}`, token);

        return token;
    }

    validateSession(token: string, gameCode: string): SessionData | null {
        const session = this.sessions.get(token);
        if (!session) return null;
        if (session.gameCode !== gameCode) return null;
        return session;
    }

    getSessionByPlayer(playerId: string, gameCode: string): SessionData | null {
        const token = this.playerToSession.get(`${gameCode}:${playerId}`);
        if (!token) return null;
        return this.sessions.get(token) ?? null;
    }

    deleteSession(token: string): void {
        const session = this.sessions.get(token);
        if (session) {
            this.playerToSession.delete(`${session.gameCode}:${session.playerId}`);
            this.sessions.delete(token);
        }
    }

    deleteSessionsForGame(gameCode: string): void {
        for (const [token, session] of this.sessions) {
            if (session.gameCode === gameCode) {
                this.playerToSession.delete(`${session.gameCode}:${session.playerId}`);
                this.sessions.delete(token);
            }
        }
    }

    cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
        const now = Date.now();
        for (const [token, session] of this.sessions) {
            if (now - session.createdAt > maxAge) {
                this.deleteSession(token);
            }
        }
    }
}

export const sessionStore = new SessionStore();
