import type { GameClientPlugin } from './types.js';

import TriviaPlayerInput from '@game/trivia/client/PlayerInput.svelte';
import TriviaDisplayBoard from '@game/trivia/client/DisplayBoard.svelte';
import TriviaResultsDisplay from '@game/trivia/client/ResultsDisplay.svelte';

import BlindArtistsPlayerInput from '@game/blind-artists/client/PlayerInput.svelte';
import BlindArtistsDisplayBoard from '@game/blind-artists/client/DisplayBoard.svelte';
import BlindArtistsResultsDisplay from '@game/blind-artists/client/ResultsDisplay.svelte';

const triviaPlugin: GameClientPlugin = {
    id: 'trivia',
    name: 'Trivia',
    description: 'Test your knowledge with multiple choice questions',
    icon: '🧠',
    minPlayers: 2,
    maxPlayers: 20,
    components: {
        PlayerInput: TriviaPlayerInput,
        DisplayBoard: TriviaDisplayBoard,
        ResultsDisplay: TriviaResultsDisplay
    }
};

const blindArtistsPlugin: GameClientPlugin = {
    id: 'blind-artists',
    name: 'Blind Artists',
    description: 'Cooperative painting where players deduce hidden pigments',
    icon: '🎨',
    minPlayers: 12,
    maxPlayers: 20,
    components: {
        PlayerInput: BlindArtistsPlayerInput,
        DisplayBoard: BlindArtistsDisplayBoard,
        ResultsDisplay: BlindArtistsResultsDisplay
    }
};

const gameRegistry = new Map<string, GameClientPlugin>([
    ['trivia', triviaPlugin],
    ['blind-artists', blindArtistsPlugin]
]);

export function getGame(id: string): GameClientPlugin | undefined {
    return gameRegistry.get(id);
}

export function getAllGames(): GameClientPlugin[] {
    return Array.from(gameRegistry.values());
}

export function getGameComponents(id: string) {
    const game = gameRegistry.get(id);
    return game?.components ?? null;
}
