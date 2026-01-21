<script lang="ts">
    import type { FinalResults } from '@game/shared';
    import { leaveGame } from '$lib/stores/game';

    export let results: FinalResults;
    export let selfId: string;

    $: myRanking = results.rankings.find((r) => r.playerId === selfId);
    $: myRank = myRanking?.rank ?? 0;

    function getPlacement(): string {
        switch (myRank) {
            case 1:
                return 'Winner!';
            case 2:
                return '2nd Place!';
            case 3:
                return '3rd Place!';
            default:
                return `${myRank}th Place`;
        }
    }
</script>

<div class="flex flex-col min-h-screen p-4">
    <div class="flex-1 flex flex-col items-center justify-center text-center">
        <h1 class="text-3xl font-bold mb-4">Game Over!</h1>

        <div class="card mb-6 w-full">
            <p class="text-gray-400 mb-2">You placed</p>
            <p
                class="text-4xl font-bold"
                class:text-yellow-400={myRank === 1}
                class:text-gray-300={myRank === 2}
                class:text-amber-600={myRank === 3}
                class:text-gray-400={myRank > 3}
            >
                {getPlacement()}
            </p>
            <p class="text-2xl text-primary-400 mt-2">{myRanking?.score ?? 0} points</p>
        </div>

        <div class="w-full">
            <h3 class="font-semibold mb-3">Final Standings</h3>
            <div class="space-y-2">
                {#each results.rankings as ranking (ranking.playerId)}
                    <div
                        class="flex justify-between p-2 rounded"
                        class:bg-primary-700={ranking.playerId === selfId}
                        class:bg-gray-700={ranking.playerId !== selfId}
                    >
                        <span>
                            {ranking.rank}. {ranking.playerName}
                            {#if ranking.playerId === selfId}(You){/if}
                        </span>
                        <span class="font-bold">{ranking.score}</span>
                    </div>
                {/each}
            </div>
        </div>
    </div>

    <div class="mt-6">
        <button class="btn btn-secondary btn-lg w-full" on:click={() => leaveGame()}>
            Leave Game
        </button>
    </div>
</div>
