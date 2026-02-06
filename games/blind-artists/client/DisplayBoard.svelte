<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { gameStore, players as playersStore } from '$lib/stores/game';
    import CanvasGrid from './components/CanvasGrid.svelte';
    import SeatingCircle from './components/SeatingCircle.svelte';

    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let roundData: {
        roundNumber: number;
        totalRounds: number;
        canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
    };

    export let publicState: {
        canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
        pigmentUsesRemaining: Record<string, number>;
        selfAssessments: Record<string, Pigment | 'unknown'>;
        roles: Record<string, Role>;
        seatingOrder: string[];
        roundNumber: number;
        totalRounds: number;
        submittedPlayers: string[];
        slotClaims: Record<string, { zone: Zone; slot: SlotType } | null>;
    } | null = null;

    $: players = $playersStore as PlayerPublic[];
    $: playerNames = Object.fromEntries(players.map(p => [p.id, p.name]));

    $: seatingOrder = publicState?.seatingOrder || [];
    $: roles = publicState?.roles || {};
    $: pigmentUsesRemaining = publicState?.pigmentUsesRemaining || {};
    $: selfAssessments = publicState?.selfAssessments || {};
    $: canvasOccupied = publicState?.canvasOccupied || roundData.canvasOccupied;
    $: slotClaims = publicState?.slotClaims || {};
    $: submittedPlayers = publicState?.submittedPlayers || [];

    $: submittedCount = submittedPlayers.length;
    $: totalPlayers = seatingOrder.length;

    // Count occupied slots
    $: occupiedCount = Object.values(canvasOccupied).reduce((sum, zone) =>
        sum + Object.values(zone).filter(Boolean).length, 0);
</script>

<div class="display-board p-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Canvas -->
        <div class="card">
            <h3 class="text-lg font-bold mb-4">Canvas ({occupiedCount}/16 painted)</h3>
            <div class="max-w-xs mx-auto">
                <CanvasGrid
                    {canvasOccupied}
                    {slotClaims}
                    {playerNames}
                />
            </div>
        </div>

        <!-- Seating Circle -->
        <div class="card">
            <h3 class="text-lg font-bold mb-4">Players ({submittedCount}/{totalPlayers} ready)</h3>
            <SeatingCircle
                {players}
                {seatingOrder}
                {roles}
                {pigmentUsesRemaining}
                {selfAssessments}
                selfId={null}
                compact={true}
            >
                <div slot="center" class="text-center">
                    <p class="text-2xl font-bold">{roundData.roundNumber}</p>
                    <p class="text-xs text-gray-400">of {roundData.totalRounds}</p>
                </div>
            </SeatingCircle>
        </div>
    </div>

    <!-- Role Legend -->
    <div class="mt-4 flex justify-center gap-4 text-sm">
        <span class="text-blue-400">🖌️ Fine Brush</span>
        <span class="text-purple-400">🖼️ Thick Brush</span>
        <span class="text-green-400">🎨 Painter</span>
        <span class="text-yellow-400">📡 Liaison</span>
    </div>
</div>
