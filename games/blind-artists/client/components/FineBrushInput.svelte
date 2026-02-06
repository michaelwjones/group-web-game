<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { submitResponse } from '$lib/stores/game';
    import SeatingCircle from './SeatingCircle.svelte';
    import SelfAssessment from './SelfAssessment.svelte';

    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let players: PlayerPublic[];
    export let seatingOrder: string[];
    export let roles: Record<string, Role>;
    export let pigmentUsesRemaining: Record<string, number>;
    export let selfAssessments: Record<string, Pigment | 'unknown'>;
    export let selfId: string;

    let selectedPlayer: string | null = null;

    // Players with no remaining uses are disabled
    $: disabledPlayers = Object.entries(pigmentUsesRemaining)
        .filter(([_, uses]) => uses <= 0)
        .map(([id]) => id);

    function selectPlayer(playerId: string) {
        selectedPlayer = playerId;
        submitResponse({
            type: 'fine-brush',
            targetPlayer: playerId
        });
    }
</script>

<div class="fine-brush-input p-4">
    <div class="text-center mb-4">
        <h3 class="text-lg font-bold text-blue-400">🖌️ Fine Brush</h3>
        <p class="text-sm text-gray-400">Select 1 player to create a primary color</p>
    </div>

    <SeatingCircle
        {players}
        {seatingOrder}
        {roles}
        {pigmentUsesRemaining}
        {selfAssessments}
        {selfId}
        onPlayerClick={selectPlayer}
        selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
        {disabledPlayers}
    >
        <div slot="center" class="text-gray-500">
            {#if selectedPlayer}
                <span class="text-primary-400">Selected</span>
            {:else}
                <span>Tap a player</span>
            {/if}
        </div>
    </SeatingCircle>

    <div class="mt-4 flex justify-center">
        <SelfAssessment currentAssessment={selfAssessments[selfId] || 'unknown'} />
    </div>
</div>
