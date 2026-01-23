<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        gameStore,
        gameStatus,
        players,
        publicState
    } from '$lib/stores/game';
    import Lobby from '$lib/components/common-display/Lobby.svelte';
    import RoundDisplay from '$lib/components/common-display/RoundDisplay.svelte';
    import RoundResults from '$lib/components/common-display/RoundResults.svelte';
    import FinalResults from '$lib/components/common-display/FinalResults.svelte';

    // Game-specific display components would be dynamically loaded
    import TriviaDisplayBoard from '@game/trivia/client/DisplayBoard.svelte';
    import TriviaResultsDisplay from '@game/trivia/client/ResultsDisplay.svelte';

    $: gameCode = $page.params.gameCode;
    $: displayState = $gameStore.displayState;
    $: currentRound = $gameStore.currentRound;
    $: roundResults = $gameStore.roundResults;
    $: finalResults = $gameStore.finalResults;
    $: respondedPlayers = $gameStore.respondedPlayers;

    // Redirect if not display
    $: if (!$gameStore.isDisplay && $gameStore.viewMode !== 'display') {
        goto(`${base}/`);
    }

    $: isLastRound = displayState
        ? displayState.currentRound >= displayState.totalRounds
        : false;
</script>

<svelte:head>
    <title>Game Display - {gameCode}</title>
</svelte:head>

{#if $gameStatus === 'lobby'}
    <Lobby
        code={gameCode}
        players={$players}
        hostId={displayState?.hostId ?? null}
        minPlayers={2}
    />
{:else if $gameStatus === 'in_progress' && currentRound}
    <RoundDisplay
        round={currentRound}
        players={$players}
        hostId={displayState?.hostId ?? null}
        {respondedPlayers}
        totalRounds={displayState?.totalRounds ?? 1}
        GameDisplay={TriviaDisplayBoard}
        publicState={$publicState}
    />
{:else if $gameStatus === 'between_rounds' && roundResults}
    <RoundResults
        results={roundResults}
        players={$players}
        hostId={displayState?.hostId ?? null}
        totalRounds={displayState?.totalRounds ?? 1}
        {isLastRound}
        ResultsDisplay={TriviaResultsDisplay}
    />
{:else if $gameStatus === 'ended' && finalResults}
    <FinalResults results={finalResults} />
{:else}
    <div class="flex items-center justify-center min-h-screen">
        <p class="text-gray-400">Loading...</p>
    </div>
{/if}
