<script lang="ts">
    import type { PlayerPublic } from '@game/shared';

    export let players: PlayerPublic[] = [];
    export let hostId: string | null = null;
    export let respondedPlayers: Set<string> = new Set();
    export let showScores: boolean = false;
    export let highlightId: string | null = null;
</script>

<div class="space-y-2">
    {#each players as player (player.id)}
        <div
            class="flex items-center justify-between p-3 rounded-lg transition-colors"
            class:bg-gray-700={player.id !== highlightId}
            class:bg-primary-700={player.id === highlightId}
            class:opacity-50={player.connectionStatus === 'disconnected'}
        >
            <div class="flex items-center gap-2">
                <span class="font-medium">{player.name}</span>
                {#if player.id === hostId}
                    <span class="text-xs bg-primary-600 px-2 py-0.5 rounded">Host</span>
                {/if}
                {#if player.connectionStatus === 'disconnected'}
                    <span class="text-xs text-yellow-400">(offline)</span>
                {/if}
            </div>
            <div class="flex items-center gap-3">
                {#if respondedPlayers.has(player.id)}
                    <span class="text-green-400 text-sm">Ready</span>
                {/if}
                {#if showScores}
                    <span class="text-xl font-bold text-primary-400">{player.score}</span>
                {/if}
            </div>
        </div>
    {/each}
</div>
