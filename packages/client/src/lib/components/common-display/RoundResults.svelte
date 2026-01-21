<script lang="ts">
    import type { PlayerPublic, RoundResults } from '@game/shared';
    import PlayerList from '../shared/PlayerList.svelte';

    export let results: RoundResults;
    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let totalRounds: number = 1;
    export let isLastRound: boolean = false;

    // Dynamic component for game-specific results
    export let ResultsDisplay: any = null;

    // Sort players by score
    $: sortedPlayers = [...players].sort((a, b) => b.score - a.score);
</script>

<div class="min-h-screen p-8">
    <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2">Round {results.roundNumber} Results</h2>
        <p class="text-gray-400">
            {#if isLastRound}
                Final round complete!
            {:else}
                Round {results.roundNumber} of {totalRounds}
            {/if}
        </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div>
            {#if ResultsDisplay}
                <svelte:component this={ResultsDisplay} {results} />
            {:else}
                <div class="card">
                    <h3 class="text-xl font-semibold mb-4">Round Summary</h3>
                    <p class="text-gray-400">Round complete!</p>
                </div>
            {/if}
        </div>

        <div>
            <div class="card">
                <h3 class="text-xl font-semibold mb-4">Leaderboard</h3>
                <PlayerList players={sortedPlayers} {hostId} showScores={true} />
            </div>
        </div>
    </div>

    <div class="text-center mt-8 text-gray-400">
        {#if isLastRound}
            Waiting for host to show final results...
        {:else}
            Waiting for host to start next round...
        {/if}
    </div>
</div>
