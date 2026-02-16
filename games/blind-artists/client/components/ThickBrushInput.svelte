<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { submitResponse } from '$lib/stores/game';
    import SeatingCircle from './SeatingCircle.svelte';
    import SelfAssessment from './SelfAssessment.svelte';
    import { statusTextClass } from './selection';

    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let players: PlayerPublic[];
    export let seatingOrder: string[];
    export let roles: Record<string, Role>;
    export let pigmentUsesRemaining: Record<string, number>;
    export let selfAssessments: Record<string, Pigment | 'unknown'>;
    export let selfId: string;
    export let submittedPlayers: string[] = [];

    let selectedPlayers: string[] = [];

    $: confirmed = submittedPlayers.includes(selfId) && selectedPlayers.length === 2;

    // Get neighbors for a player
    function getNeighbors(playerId: string): string[] {
        const idx = seatingOrder.indexOf(playerId);
        if (idx === -1) return [];
        const left = seatingOrder[(idx - 1 + seatingOrder.length) % seatingOrder.length];
        const right = seatingOrder[(idx + 1) % seatingOrder.length];
        return [left, right];
    }

    // Players with no remaining uses are disabled (unless already selected first)
    $: disabledPlayers = (() => {
        const disabled: string[] = [];

        // Disable players with no uses
        for (const [id, uses] of Object.entries(pigmentUsesRemaining)) {
            if (uses <= 0) disabled.push(id);
        }

        // If one player is selected, disable non-adjacent players
        if (selectedPlayers.length === 1) {
            const neighbors = getNeighbors(selectedPlayers[0]);
            for (const playerId of seatingOrder) {
                if (playerId !== selectedPlayers[0] && !neighbors.includes(playerId)) {
                    if (!disabled.includes(playerId)) disabled.push(playerId);
                }
            }
        }

        return disabled;
    })();

    function selectPlayer(playerId: string) {
        if (selectedPlayers.includes(playerId)) {
            // Deselect
            selectedPlayers = selectedPlayers.filter(id => id !== playerId);
        } else if (selectedPlayers.length < 2) {
            // Select
            selectedPlayers = [...selectedPlayers, playerId];

            if (selectedPlayers.length === 2) {
                // Submit response
                submitResponse({
                    type: 'thick-brush',
                    targetPlayers: selectedPlayers as [string, string]
                });
            }
        }
    }

    function clearSelection() {
        selectedPlayers = [];
    }
</script>

<div class="thick-brush-input p-4">
    <div class="text-center mb-4">
        <h3 class="text-lg font-bold text-purple-400">🖼️ Thick Brush</h3>
        <p class="text-sm text-gray-400">Select 2 adjacent players to mix colors</p>
    </div>

    <SeatingCircle
        {players}
        {seatingOrder}
        {roles}
        {pigmentUsesRemaining}
        {selfAssessments}
        {selfId}
        onPlayerClick={selectPlayer}
        {selectedPlayers}
        confirmedPlayers={confirmed ? selectedPlayers : []}
        {disabledPlayers}
    >
        <div slot="center" class="text-gray-500 text-center">
            {#if selectedPlayers.length === 2}
                <span class="{statusTextClass(confirmed ? 'confirmed' : 'pending')}">
                    {confirmed ? '✓ Confirmed!' : '⏳ Submitting...'}
                </span>
                <button class="block text-xs text-gray-400 hover:text-white" on:click={clearSelection}>
                    Change
                </button>
            {:else if selectedPlayers.length === 1}
                <span>Select neighbor</span>
            {:else}
                <span>Select 2 players</span>
            {/if}
        </div>
    </SeatingCircle>

    <div class="mt-4 flex justify-center">
        <SelfAssessment currentAssessment={selfAssessments[selfId] || 'unknown'} />
    </div>
</div>
