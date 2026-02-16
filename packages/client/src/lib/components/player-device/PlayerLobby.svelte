<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { claimHost, startGame, leaveGame } from '$lib/stores/game';
    import PlayerList from '../shared/PlayerList.svelte';
    import SeatingSetup from '@game/blind-artists/client/components/SeatingSetup.svelte';

    export let code: string;
    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let isHost: boolean = false;
    export let selfId: string;
    export let minPlayers: number = 2;
    export let gameType: string = '';

    $: canStart = players.length >= minPlayers;
    $: isBlindArtists = gameType === 'blind-artists';

    let seatingOrder: string[] = [];

    function handleSeatingChange(e: CustomEvent<string[]>) {
        seatingOrder = e.detail;
    }

    function handleStart() {
        if (isBlindArtists && seatingOrder.length > 0) {
            startGame({ seatingOrder });
        } else {
            startGame();
        }
    }
</script>

<div class="flex flex-col min-h-screen p-4">
    <div class="text-center mb-6">
        <p class="text-gray-400 text-sm">Game Code</p>
        <p class="text-2xl font-bold text-primary-400">{code}</p>
    </div>

    <div class="flex-1">
        <h3 class="text-lg font-semibold mb-3">
            Players ({players.length})
        </h3>

        {#if isBlindArtists && isHost}
            <SeatingSetup
                {players}
                {selfId}
                {hostId}
                on:change={handleSeatingChange}
            />
        {:else if isBlindArtists}
            <!-- Non-host read-only numbered seating list -->
            <div class="bg-blue-900/40 border border-blue-700/50 rounded-lg p-3 text-sm text-blue-200 mb-3">
                Host is arranging seating...
            </div>
            <div class="space-y-2">
                {#each players as player, index (player.id)}
                    <div
                        class="flex items-center gap-2 p-3 rounded-lg
                            {player.id === selfId ? 'bg-primary-700' : 'bg-gray-700'}
                            {player.connectionStatus === 'disconnected' ? 'opacity-50' : ''}"
                    >
                        <span class="text-gray-400 text-sm font-mono w-5 text-right shrink-0">
                            {index + 1}
                        </span>
                        <span class="font-medium flex-1 truncate">{player.name}</span>
                        {#if player.id === hostId}
                            <span class="text-xs bg-primary-600 px-2 py-0.5 rounded shrink-0">Host</span>
                        {/if}
                        {#if player.id === selfId}
                            <span class="text-xs bg-gray-600 px-2 py-0.5 rounded shrink-0">You</span>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <PlayerList {players} {hostId} highlightId={selfId} showScores={false} />
        {/if}
    </div>

    <div class="space-y-3 mt-6">
        {#if isHost}
            <button
                class="btn btn-success btn-lg w-full"
                disabled={!canStart}
                on:click={handleStart}
            >
                {#if canStart}
                    Start Game
                {:else}
                    Need {minPlayers - players.length} more player{minPlayers - players.length > 1
                        ? 's'
                        : ''}
                {/if}
            </button>
        {:else}
            <button class="btn btn-secondary btn-lg w-full" on:click={() => claimHost()}>
                Become Host
            </button>
            <p class="text-center text-gray-500 text-sm">
                Waiting for host to start...
            </p>
        {/if}

        <button class="btn btn-danger w-full" on:click={() => leaveGame()}>
            Leave Game
        </button>
    </div>
</div>
