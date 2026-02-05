<script lang="ts">
    import type { RoundData } from '@game/shared';
    import { nextRound } from '$lib/stores/game';

    export let round: RoundData;
    export let hasResponded: boolean = false;
    export let totalRounds: number = 1;
    export let isHost: boolean = false;

    // Dynamic component for game-specific input
    export let GameInput: any = null;
    export let privateState: unknown = null;
</script>

<div class="flex flex-col min-h-screen p-4">
    <div class="text-center mb-4">
        <p class="text-gray-400 text-sm">Round</p>
        <p class="text-xl font-bold">{round.roundNumber} / {totalRounds}</p>
    </div>

    <div class="flex-1 flex flex-col">
        {#if GameInput}
            <svelte:component
                this={GameInput}
                roundData={round.data}
                {privateState}
                {hasResponded}
            />
        {:else if hasResponded}
            <div class="flex-1 flex items-center justify-center">
                <div class="text-center">
                    <div class="text-4xl mb-4">✓</div>
                    <p class="text-xl text-gray-400">Waiting for others</p>
                </div>
            </div>
        {:else}
            <div class="flex-1 flex items-center justify-center">
                <p class="text-gray-400">Round in progress...</p>
            </div>
        {/if}
    </div>

    {#if isHost}
        <div class="mt-4 pt-4 border-t border-gray-700">
            <button
                class="w-full btn btn-primary"
                on:click={() => nextRound()}
            >
                End Round
            </button>
        </div>
    {/if}
</div>
