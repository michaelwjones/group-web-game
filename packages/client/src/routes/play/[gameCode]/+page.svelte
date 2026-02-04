<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import {
        gameStore,
        gameStatus,
        players,
        isHost,
        selfId,
        privateState,
        joinGame
    } from '$lib/stores/game';
    import { parseTestModeParams, postToParent } from '$lib/stores/test-mode';
    import { getGameComponents } from '$lib/games/registry';
    import PlayerLobby from '$lib/components/player-device/PlayerLobby.svelte';
    import PlayerRound from '$lib/components/player-device/PlayerRound.svelte';
    import PlayerResults from '$lib/components/player-device/PlayerResults.svelte';
    import PlayerFinal from '$lib/components/player-device/PlayerFinal.svelte';

    let autoJoinHandled = false;
    let joinedPosted = false;

    $: gameCode = $page.params.gameCode ?? '';

    onMount(() => {
        const params = parseTestModeParams();

        // Handle auto-join in test mode
        if (params.autoJoin && params.playerName && !autoJoinHandled) {
            autoJoinHandled = true;
            const code = $page.params.gameCode ?? '';
            // Delay to ensure WebSocket is connected
            setTimeout(() => {
                joinGame(code, params.playerName!);
            }, 500);
        }
    });

    // Post joined message to parent (for test mode)
    $: if ($gameStore.viewMode === 'player' && $selfId && !joinedPosted) {
        joinedPosted = true;
        postToParent({ type: 'JOINED', clientId: $selfId });
    }
    $: playerState = $gameStore.playerState;
    $: gameType = playerState?.gameType ?? null;
    $: gameComponents = gameType ? getGameComponents(gameType) : null;
    $: currentRound = $gameStore.currentRound;
    $: roundResults = $gameStore.roundResults;
    $: finalResults = $gameStore.finalResults;
    $: hasResponded = $gameStore.hasResponded;

    // Redirect if not a player
    $: if ($gameStore.isDisplay || $gameStore.viewMode === 'home') {
        goto(`${base}/`);
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
{:else if $gameStatus === 'in_progress' && currentRound && gameComponents}
    <PlayerRound
        round={currentRound}
        {hasResponded}
        totalRounds={playerState?.totalRounds ?? 1}
        GameInput={gameComponents.PlayerInput}
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
