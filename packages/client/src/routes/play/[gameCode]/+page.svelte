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
    import { parseTestModeParams, postToParent, isTestMode } from '$lib/stores/test-mode';
    import { connectionState } from '$lib/stores/connection';
    import { clearPlayerSession } from '$lib/stores/player';
    import { getGameComponents } from '$lib/games/registry';
    import PlayerLobby from '$lib/components/player-device/PlayerLobby.svelte';
    import PlayerRound from '$lib/components/player-device/PlayerRound.svelte';
    import PlayerResults from '$lib/components/player-device/PlayerResults.svelte';
    import PlayerFinal from '$lib/components/player-device/PlayerFinal.svelte';

    let autoJoinHandled = false;
    let autoJoinPending = false;
    let autoJoinParams: ReturnType<typeof parseTestModeParams> | null = null;
    let joinedPosted = false;
    let isAutoJoining = false;

    $: gameCode = $page.params.gameCode ?? '';

    onMount(() => {
        const params = parseTestModeParams();

        // Handle auto-join in test mode
        if (params.autoJoin && params.playerName && !autoJoinHandled) {
            autoJoinHandled = true;
            isAutoJoining = true;

            // Clear any existing session to start fresh
            if (params.testMode) {
                clearPlayerSession();
            }

            // Mark pending — the reactive block below fires joinGame once connected
            autoJoinParams = params;
            autoJoinPending = true;
        }
    });

    // Wait for WebSocket to connect before auto-joining (handles server cold start)
    $: if (autoJoinPending && $connectionState === 'connected' && autoJoinParams) {
        autoJoinPending = false;
        const code = $page.params.gameCode ?? '';
        joinGame(code, autoJoinParams.playerName!);
    }

    // Post joined message to parent (for test mode)
    $: if ($gameStore.viewMode === 'player' && $selfId && !joinedPosted) {
        joinedPosted = true;
        isAutoJoining = false;
        postToParent({ type: 'JOINED', clientId: $selfId });
    }
    $: playerState = $gameStore.playerState;
    $: gameType = playerState?.gameType ?? null;
    $: gameComponents = gameType ? getGameComponents(gameType) : null;
    $: currentRound = $gameStore.currentRound;
    $: roundResults = $gameStore.roundResults;
    $: finalResults = $gameStore.finalResults;
    $: hasResponded = $gameStore.hasResponded;

    // Redirect if not a player (but not while auto-joining in test mode)
    $: if (!isAutoJoining && ($gameStore.isDisplay || $gameStore.viewMode === 'home')) {
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
        isHost={$isHost}
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
