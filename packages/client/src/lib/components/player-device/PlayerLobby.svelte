<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { claimHost, startGame, leaveGame } from '$lib/stores/game';
    import PlayerList from '../shared/PlayerList.svelte';

    export let code: string;
    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let isHost: boolean = false;
    export let selfId: string;
    export let minPlayers: number = 2;

    $: canStart = players.length >= minPlayers;
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
        <PlayerList {players} {hostId} highlightId={selfId} showScores={false} />
    </div>

    <div class="space-y-3 mt-6">
        {#if isHost}
            <button
                class="btn btn-success btn-lg w-full"
                disabled={!canStart}
                on:click={() => startGame()}
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
