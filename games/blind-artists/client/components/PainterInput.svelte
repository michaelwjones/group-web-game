<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { submitResponse } from '$lib/stores/game';
    import CanvasGrid from './CanvasGrid.svelte';
    import SelfAssessment from './SelfAssessment.svelte';
    import { selectionState, buttonClass, statusTextClass } from './selection';

    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';
    type PainterSubtype = Zone | SlotType;

    const ALL_ZONES: Zone[] = ['back', 'mid', 'fore', 'focus'];
    const ALL_SLOTS: SlotType[] = ['primary', 'secondary', 'highlight', 'shadow'];

    export let players: PlayerPublic[];
    export let seatingOrder: string[];
    export let roles: Record<string, Role>;
    export let painterSubtypes: Record<string, PainterSubtype> = {};
    export let pigmentUsesRemaining: Record<string, number>;
    export let selfAssessments: Record<string, Pigment | 'unknown'>;
    export let selfId: string;
    export let canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
    export let slotClaims: Record<string, { zone: Zone; slot: SlotType } | null>;
    export let submittedPlayers: string[] = [];

    $: ownSubtype = painterSubtypes[selfId] ?? null;

    let selectedBrush: string | null = null;
    let selectedSlot: { zone: Zone; slot: SlotType } | null = null;

    $: confirmed = submittedPlayers.includes(selfId) && selectedBrush !== null && selectedSlot !== null;

    // Get brush players
    $: brushPlayers = seatingOrder.filter(id =>
        roles[id] === 'fine-brush' || roles[id] === 'thick-brush'
    );

    // Get player names
    $: playerNames = Object.fromEntries(players.map(p => [p.id, p.name]));

    // Slots outside this painter's subtype
    $: subtypeInvalidSlots = (() => {
        if (!ownSubtype) return [];
        const isZone = ALL_ZONES.includes(ownSubtype as Zone);
        const invalid: { zone: Zone; slot: SlotType }[] = [];
        for (const z of ALL_ZONES) {
            for (const s of ALL_SLOTS) {
                if (isZone ? z !== ownSubtype : s !== ownSubtype) {
                    invalid.push({ zone: z, slot: s });
                }
            }
        }
        return invalid;
    })();

    // Slots claimed by other painters
    $: claimedByOthers = Object.entries(slotClaims)
        .filter(([id, claim]) => id !== selfId && claim !== null)
        .map(([_, claim]) => claim!);

    $: disabledSlots = [...subtypeInvalidSlots, ...claimedByOthers];

    function selectBrush(brushId: string) {
        selectedBrush = brushId;
        trySubmit();
    }

    function selectSlot(zone: Zone, slot: SlotType) {
        selectedSlot = { zone, slot };
        trySubmit();
    }

    function trySubmit() {
        if (selectedBrush && selectedSlot) {
            submitResponse({
                type: 'painter',
                brushPlayer: selectedBrush,
                zone: selectedSlot.zone,
                slot: selectedSlot.slot
            });
        }
    }

    function getBrushIcon(role: Role): string {
        return role === 'fine-brush' ? '🖌️' : '🖼️';
    }
</script>

<div class="painter-input p-4">
    <div class="text-center mb-4">
        <h3 class="text-lg font-bold text-green-400">🎨 Painter</h3>
        {#if ownSubtype}
            <p class="text-sm text-green-300 font-medium capitalize">{ownSubtype} painter</p>
        {/if}
        <p class="text-sm text-gray-400">Select a brush and a valid slot to paint</p>
    </div>

    <!-- Brush selection -->
    <div class="mb-4">
        <p class="text-xs text-gray-400 mb-2">Choose a brush:</p>
        <div class="flex flex-wrap gap-2 justify-center">
            {#each brushPlayers as brushId}
                {@const role = roles[brushId]}
                {@const name = playerNames[brushId] || brushId}
                <button
                    class="px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2
                        {buttonClass(selectionState(selectedBrush === brushId, confirmed && selectedBrush === brushId))}"
                    on:click={() => selectBrush(brushId)}
                >
                    <span>{getBrushIcon(role)}</span>
                    <span class="text-sm">{name}</span>
                </button>
            {/each}
        </div>
    </div>

    <!-- Canvas grid -->
    <div class="mb-4">
        <p class="text-xs text-gray-400 mb-2">Choose a slot:</p>
        <CanvasGrid
            {canvasOccupied}
            {slotClaims}
            {playerNames}
            onSlotClick={selectSlot}
            {selectedSlot}
            confirmedSlot={confirmed ? selectedSlot : null}
            {disabledSlots}
        />
    </div>

    <!-- Status -->
    {#if selectedBrush && selectedSlot}
        <div class="text-center text-sm mb-4 {statusTextClass(confirmed ? 'confirmed' : 'pending')}">
            {confirmed ? '✓ Confirmed!' : '⏳ Submitting...'}
        </div>
    {:else}
        <div class="text-center text-gray-500 text-sm mb-4">
            {#if !selectedBrush}
                Select a brush above
            {:else}
                Select a slot on the canvas
            {/if}
        </div>
    {/if}

    <div class="flex justify-center">
        <SelfAssessment currentAssessment={selfAssessments[selfId] || 'unknown'} />
    </div>
</div>
