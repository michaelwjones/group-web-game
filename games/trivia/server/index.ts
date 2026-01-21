import type { GamePlugin, PlayerResponse, RoundStartData, GameSession, GameConfig } from '@game/shared';
import { getRandomQuestions, type TriviaQuestion } from './questions.js';

// Trivia-specific state types
interface TriviaHiddenState {
    questions: TriviaQuestion[];
    currentQuestion: TriviaQuestion | null;
    playerAnswers: Map<string, number>;
}

interface TriviaPublicState {
    category: string | null;
    answeredCount: number;
    totalPlayers: number;
}

interface TriviaRoundData {
    question: string;
    options: string[];
    category: string;
    questionNumber: number;
    totalQuestions: number;
}

interface TriviaRoundResults {
    question: string;
    options: string[];
    correctIndex: number;
    playerAnswers: Record<string, { answer: number; correct: boolean; points: number }>;
}

interface TriviaFinalResults {
    totalQuestions: number;
    playerStats: Record<string, { correct: number; total: number }>;
}

const POINTS_CORRECT = 100;
const ROUND_TIME_LIMIT = 30000; // 30 seconds

export const triviaPlugin: GamePlugin<
    TriviaHiddenState,
    TriviaPublicState,
    null,
    TriviaRoundData,
    TriviaRoundResults,
    TriviaFinalResults
> = {
    id: 'trivia',
    name: 'Trivia',
    minPlayers: 2,
    maxPlayers: 20,
    defaultRounds: 5,

    createInitialState(players: string[], config: GameConfig) {
        const questions = getRandomQuestions(config.totalRounds);

        return {
            hidden: {
                questions,
                currentQuestion: null,
                playerAnswers: new Map()
            },
            public: {
                category: null,
                answeredCount: 0,
                totalPlayers: players.length
            },
            playerPrivate: new Map()
        };
    },

    onRoundStart(
        roundNumber: number,
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ): RoundStartData<TriviaRoundData> {
        const question = session.hiddenState.questions[roundNumber - 1];

        return {
            roundData: {
                question: question.question,
                options: question.options,
                category: question.category,
                questionNumber: roundNumber,
                totalQuestions: session.totalRounds
            },
            hiddenData: {
                ...session.hiddenState,
                currentQuestion: question,
                playerAnswers: new Map()
            },
            timeLimit: ROUND_TIME_LIMIT
        };
    },

    validateResponse(
        playerId: string,
        response: unknown,
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ): { valid: boolean; error?: string } {
        if (typeof response !== 'number') {
            return { valid: false, error: 'Response must be a number' };
        }

        if (response < 0 || response > 3) {
            return { valid: false, error: 'Invalid answer index' };
        }

        return { valid: true };
    },

    onResponseReceived(
        playerId: string,
        response: unknown,
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ) {
        const answerIndex = response as number;
        const newPlayerAnswers = new Map(session.hiddenState.playerAnswers);
        newPlayerAnswers.set(playerId, answerIndex);

        return {
            hidden: {
                ...session.hiddenState,
                playerAnswers: newPlayerAnswers
            },
            public: {
                ...session.publicState,
                answeredCount: newPlayerAnswers.size
            }
        };
    },

    onAllResponsesReceived(
        responses: PlayerResponse[],
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ) {
        const question = session.hiddenState.currentQuestion!;
        const playerAnswers: Record<string, { answer: number; correct: boolean; points: number }> = {};

        for (const response of responses) {
            const answer = response.response as number;
            const correct = answer === question.correctIndex;
            playerAnswers[response.playerId] = {
                answer,
                correct,
                points: correct ? POINTS_CORRECT : 0
            };
        }

        return {
            results: {
                question: question.question,
                options: question.options,
                correctIndex: question.correctIndex,
                playerAnswers
            },
            hidden: session.hiddenState,
            public: {
                ...session.publicState,
                answeredCount: 0
            }
        };
    },

    calculateScores(
        results: TriviaRoundResults,
        currentScores: Map<string, number>,
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ): Map<string, number> {
        const newScores = new Map(currentScores);

        for (const [playerId, result] of Object.entries(results.playerAnswers)) {
            const current = newScores.get(playerId) ?? 0;
            newScores.set(playerId, current + result.points);
        }

        return newScores;
    },

    onGameEnd(
        session: GameSession<TriviaHiddenState, TriviaPublicState, null>
    ): TriviaFinalResults {
        const playerStats: Record<string, { correct: number; total: number }> = {};

        for (const player of session.players.values()) {
            playerStats[player.id] = {
                correct: Math.floor(player.score / POINTS_CORRECT),
                total: session.totalRounds
            };
        }

        return {
            totalQuestions: session.totalRounds,
            playerStats
        };
    }
};

export default triviaPlugin;
