<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import PlayerList from '../shared/PlayerList.svelte';

    export let code: string;
    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let minPlayers: number = 2;
</script>

<div class="flex flex-col items-center justify-center min-h-screen p-8">
    <div class="text-center mb-12">
        <h2 class="text-2xl text-gray-400 mb-4">Join at</h2>
        <p class="text-lg text-gray-500 mb-2">Enter code:</p>
        <div class="join-code">{code}</div>
    </div>

    <div class="w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4 text-center">
            Players ({players.length})
        </h3>

        {#if players.length === 0}
            <p class="text-gray-500 text-center py-8">Waiting for players to join...</p>
        {:else}
            <PlayerList {players} {hostId} showScores={false} />
        {/if}

        {#if players.length < minPlayers}
            <p class="text-center text-gray-500 mt-6">
                Need at least {minPlayers} players to start
            </p>
        {:else}
            <p class="text-center text-green-400 mt-6">
                Ready to start! Host can begin the game.
            </p>
        {/if}
    </div>
</div>
