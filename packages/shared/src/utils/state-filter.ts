import type { GameSession, GameStateForDisplay, GameStateForPlayer } from '../types/game-state.js';
import type { Player } from '../types/player.js';
import { toPlayerPublic } from '../types/player.js';

export function filterStateForDisplay<TPublic>(
    session: GameSession<unknown, TPublic, unknown>
): GameStateForDisplay<TPublic> {
    const players = Array.from(session.players.values()).map(toPlayerPublic);

    return {
        code: session.code,
        status: session.status,
        gameType: session.gameType,
        players,
        hostId: session.hostId,
        currentRound: session.currentRound,
        totalRounds: session.totalRounds,
        roundStartedAt: session.roundStartedAt,
        roundTimeLimit: session.roundTimeLimit,
        publicState: session.publicState
    };
}

export function filterStateForPlayer<TPublic, TPlayerPrivate>(
    session: GameSession<unknown, TPublic, TPlayerPrivate>,
    player: Player
): GameStateForPlayer<TPublic, TPlayerPrivate> {
    const players = Array.from(session.players.values()).map(toPlayerPublic);
    const privateState = session.playerPrivateState.get(player.id) ?? null;

    return {
        code: session.code,
        status: session.status,
        gameType: session.gameType,
        players,
        hostId: session.hostId,
        currentRound: session.currentRound,
        totalRounds: session.totalRounds,
        roundStartedAt: session.roundStartedAt,
        roundTimeLimit: session.roundTimeLimit,
        publicState: session.publicState,
        privateState,
        selfId: player.id,
        isHost: player.isHost
    };
}
