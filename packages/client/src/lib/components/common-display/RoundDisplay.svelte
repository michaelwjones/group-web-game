<script lang="ts">
    import type { PlayerPublic, RoundData } from '@game/shared';
    import PlayerList from '../shared/PlayerList.svelte';

    export let round: RoundData;
    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let respondedPlayers: Set<string> = new Set();
    export let totalRounds: number = 1;

    // Dynamic component for game-specific display
    export let GameDisplay: any = null;
    export let publicState: unknown = null;

    $: respondedCount = respondedPlayers.size;
    $: totalPlayers = players.filter((p) => p.connectionStatus === 'connected').length;
</script>

<div class="min-h-screen p-8">
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold">Round {round.roundNumber} / {totalRounds}</h2>
        <div class="text-xl">
            Responses: {respondedCount} / {totalPlayers}
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
            {#if GameDisplay}
                <svelte:component this={GameDisplay} roundData={round.data} {publicState} />
            {:else}
                <div class="card">
                    <p class="text-gray-400">Round {round.roundNumber} in progress...</p>
                </div>
            {/if}
        </div>

        <div>
            <h3 class="text-xl font-semibold mb-4">Players</h3>
            <PlayerList {players} {hostId} {respondedPlayers} showScores={true} />
        </div>
    </div>
</div>
