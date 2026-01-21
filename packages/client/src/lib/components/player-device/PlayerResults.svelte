<script lang="ts">
    import type { RoundResults, PlayerPublic } from '@game/shared';
    import { nextRound, endGame } from '$lib/stores/game';

    export let results: RoundResults;
    export let players: PlayerPublic[] = [];
    export let selfId: string;
    export let isHost: boolean = false;
    export let isLastRound: boolean = false;

    $: self = players.find((p) => p.id === selfId);
    $: scoreChange = results.scoreChanges[selfId] ?? 0;
    $: sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    $: myRank = sortedPlayers.findIndex((p) => p.id === selfId) + 1;
</script>

<div class="flex flex-col min-h-screen p-4">
    <div class="text-center mb-6">
        <p class="text-gray-400 text-sm">Round {results.roundNumber} Complete</p>
    </div>

    <div class="card text-center mb-6">
        <p class="text-gray-400 mb-2">Your Score</p>
        <p class="text-4xl font-bold text-primary-400">{self?.score ?? 0}</p>
        {#if scoreChange > 0}
            <p class="text-green-400 text-lg">+{scoreChange}</p>
        {:else if scoreChange < 0}
            <p class="text-red-400 text-lg">{scoreChange}</p>
        {/if}
        <p class="text-gray-500 mt-2">Rank: {myRank} of {players.length}</p>
    </div>

    <div class="flex-1">
        <h3 class="font-semibold mb-3">Leaderboard</h3>
        <div class="space-y-2">
            {#each sortedPlayers.slice(0, 5) as player, i (player.id)}
                <div
                    class="flex justify-between p-2 rounded"
                    class:bg-primary-700={player.id === selfId}
                    class:bg-gray-700={player.id !== selfId}
                >
                    <span>
                        {i + 1}. {player.name}
                        {#if player.id === selfId}(You){/if}
                    </span>
                    <span class="font-bold">{player.score}</span>
                </div>
            {/each}
        </div>
    </div>

    {#if isHost}
        <div class="space-y-3 mt-6">
            {#if isLastRound}
                <button class="btn btn-primary btn-lg w-full" on:click={() => nextRound()}>
                    Show Final Results
                </button>
            {:else}
                <button class="btn btn-primary btn-lg w-full" on:click={() => nextRound()}>
                    Next Round
                </button>
                <button class="btn btn-danger w-full" on:click={() => endGame()}>
                    End Game Early
                </button>
            {/if}
        </div>
    {:else}
        <p class="text-center text-gray-500 mt-6">
            {#if isLastRound}
                Waiting for host to show final results...
            {:else}
                Waiting for host to start next round...
            {/if}
        </p>
    {/if}
</div>
