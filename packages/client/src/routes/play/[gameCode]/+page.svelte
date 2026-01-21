<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import {
        gameStore,
        gameStatus,
        players,
        isHost,
        selfId,
        privateState
    } from '$lib/stores/game';
    import PlayerLobby from '$lib/components/player-device/PlayerLobby.svelte';
    import PlayerRound from '$lib/components/player-device/PlayerRound.svelte';
    import PlayerResults from '$lib/components/player-device/PlayerResults.svelte';
    import PlayerFinal from '$lib/components/player-device/PlayerFinal.svelte';

    // Game-specific input component
    import TriviaPlayerInput from '@game/trivia/client/PlayerInput.svelte';

    $: gameCode = $page.params.gameCode;
    $: playerState = $gameStore.playerState;
    $: currentRound = $gameStore.currentRound;
    $: roundResults = $gameStore.roundResults;
    $: finalResults = $gameStore.finalResults;
    $: hasResponded = $gameStore.hasResponded;

    // Redirect if not a player
    $: if ($gameStore.isDisplay || $gameStore.viewMode === 'home') {
        goto('/');
    }

    $: isLastRound = playerState
        ? playerState.currentRound >= playerState.totalRounds
        : false;
</script>

<svelte:head>
    <title>Playing - {gameCode}</title>
</svelte:head>

{#if $gameStatus === 'lobby'}
    <PlayerLobby
        code={gameCode}
        players={$players}
        hostId={playerState?.hostId ?? null}
        isHost={$isHost}
        selfId={$selfId ?? ''}
        minPlayers={2}
    />
{:else if $gameStatus === 'in_progress' && currentRound}
    <PlayerRound
        round={currentRound}
        {hasResponded}
        totalRounds={playerState?.totalRounds ?? 1}
        GameInput={TriviaPlayerInput}
        privateState={$privateState}
    />
{:else if $gameStatus === 'between_rounds' && roundResults}
    <PlayerResults
        results={roundResults}
        players={$players}
        selfId={$selfId ?? ''}
        isHost={$isHost}
        {isLastRound}
    />
{:else if $gameStatus === 'ended' && finalResults}
    <PlayerFinal results={finalResults} selfId={$selfId ?? ''} />
{:else}
    <div class="flex items-center justify-center min-h-screen">
        <p class="text-gray-400">Loading...</p>
    </div>
{/if}
