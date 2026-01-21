<script lang="ts">
    import type { FinalResults } from '@game/shared';

    export let results: FinalResults;

    function getMedal(rank: number): string {
        switch (rank) {
            case 1:
                return '1st';
            case 2:
                return '2nd';
            case 3:
                return '3rd';
            default:
                return `${rank}th`;
        }
    }

    function getRankStyle(rank: number): string {
        switch (rank) {
            case 1:
                return 'bg-yellow-600 text-yellow-100';
            case 2:
                return 'bg-gray-400 text-gray-900';
            case 3:
                return 'bg-amber-700 text-amber-100';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    }
</script>

<div class="min-h-screen flex flex-col items-center justify-center p-8">
    <h1 class="text-4xl font-bold mb-12 text-primary-400">Game Over!</h1>

    <div class="w-full max-w-lg">
        <div class="space-y-3">
            {#each results.rankings as ranking (ranking.playerId)}
                <div
                    class="flex items-center justify-between p-4 rounded-lg {getRankStyle(ranking.rank)}"
                    class:text-2xl={ranking.rank === 1}
                    class:font-bold={ranking.rank <= 3}
                >
                    <div class="flex items-center gap-4">
                        <span class="w-12 text-center">{getMedal(ranking.rank)}</span>
                        <span>{ranking.playerName}</span>
                    </div>
                    <span class="text-xl">{ranking.score} pts</span>
                </div>
            {/each}
        </div>
    </div>

    <p class="mt-12 text-gray-400 text-center">
        Thanks for playing!<br />
        Host can start a new game.
    </p>
</div>
