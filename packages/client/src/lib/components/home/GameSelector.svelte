<script lang="ts">
    import { getAllGames } from '$lib/games/registry';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher<{ select: string; back: void }>();
    const games = getAllGames();
</script>

<div class="space-y-6">
    <h2 class="text-2xl font-bold text-center">Choose a Game</h2>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {#each games as game}
            <button
                class="card hover:border-primary-500 border-2 border-transparent transition-colors text-left p-6"
                on:click={() => dispatch('select', game.id)}
            >
                <div class="flex items-start gap-4">
                    {#if game.icon}
                        <span class="text-4xl">{game.icon}</span>
                    {/if}
                    <div>
                        <h3 class="text-xl font-semibold text-primary-400">{game.name}</h3>
                        <p class="text-gray-400 text-sm mt-1">{game.description}</p>
                        <p class="text-gray-500 text-xs mt-2">
                            {game.minPlayers}-{game.maxPlayers} players
                        </p>
                    </div>
                </div>
            </button>
        {/each}
    </div>

    <button class="btn btn-secondary w-full" on:click={() => dispatch('back')}>
        Back
    </button>
</div>
