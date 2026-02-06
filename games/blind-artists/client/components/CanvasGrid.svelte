<script lang="ts">
    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';

    export let canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
    export let canvasColors: Record<Zone, Record<SlotType, string | null>> | null = null;
    export let targetColors: Record<Zone, Record<SlotType, string>> | null = null;
    export let showComparison: boolean = false;
    export let slotClaims: Record<string, { zone: Zone; slot: SlotType } | null> = {};
    export let playerNames: Record<string, string> = {};
    export let onSlotClick: ((zone: Zone, slot: SlotType) => void) | null = null;
    export let selectedSlot: { zone: Zone; slot: SlotType } | null = null;
    export let disabledSlots: { zone: Zone; slot: SlotType }[] = [];

    const zones: Zone[] = ['back', 'mid', 'fore', 'focus'];
    const slots: SlotType[] = ['primary', 'secondary', 'highlight', 'shadow'];

    const zoneLabels: Record<Zone, string> = {
        back: 'Back',
        mid: 'Mid',
        fore: 'Fore',
        focus: 'Focus'
    };

    const slotLabels: Record<SlotType, string> = {
        primary: 'Pri',
        secondary: 'Sec',
        highlight: 'Hi',
        shadow: 'Sh'
    };

    const colorClasses: Record<string, string> = {
        red: 'bg-red-500',
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500'
    };

    function isSlotDisabled(zone: Zone, slot: SlotType): boolean {
        return disabledSlots.some(s => s.zone === zone && s.slot === slot);
    }

    function isSlotSelected(zone: Zone, slot: SlotType): boolean {
        return selectedSlot?.zone === zone && selectedSlot?.slot === slot;
    }

    function getClaimingPlayer(zone: Zone, slot: SlotType): string | null {
        for (const [playerId, claim] of Object.entries(slotClaims)) {
            if (claim && claim.zone === zone && claim.slot === slot) {
                return playerNames[playerId] || playerId;
            }
        }
        return null;
    }

    function isCorrect(zone: Zone, slot: SlotType): boolean {
        if (!canvasColors || !targetColors) return false;
        return canvasColors[zone][slot] === targetColors[zone][slot];
    }
</script>

<div class="canvas-grid">
    <!-- Header row -->
    <div class="grid grid-cols-5 gap-1 mb-1">
        <div class="text-center text-xs text-gray-500"></div>
        {#each slots as slot}
            <div class="text-center text-xs text-gray-400 font-medium">{slotLabels[slot]}</div>
        {/each}
    </div>

    <!-- Zone rows -->
    {#each zones as zone}
        <div class="grid grid-cols-5 gap-1 mb-1">
            <div class="text-xs text-gray-400 font-medium flex items-center">{zoneLabels[zone]}</div>
            {#each slots as slot}
                {@const occupied = canvasOccupied[zone][slot]}
                {@const claimingPlayer = getClaimingPlayer(zone, slot)}
                {@const disabled = isSlotDisabled(zone, slot)}
                {@const selected = isSlotSelected(zone, slot)}
                {@const canvasColor = canvasColors?.[zone][slot]}
                {@const targetColor = targetColors?.[zone][slot]}
                {@const correct = showComparison && isCorrect(zone, slot)}

                <button
                    class="aspect-square rounded border-2 transition-all text-xs flex items-center justify-center
                        {showComparison && canvasColor
                            ? colorClasses[canvasColor] || 'bg-gray-600'
                            : occupied
                                ? 'bg-gray-500'
                                : 'bg-gray-800'}
                        {selected
                            ? 'border-primary-400 ring-2 ring-primary-400'
                            : disabled
                                ? 'border-gray-700 opacity-50'
                                : claimingPlayer
                                    ? 'border-yellow-500'
                                    : 'border-gray-600'}
                        {showComparison && correct ? 'ring-2 ring-green-400' : ''}
                        {showComparison && !correct && canvasColor ? 'ring-2 ring-red-400' : ''}
                        {onSlotClick && !disabled ? 'cursor-pointer hover:border-primary-300' : ''}"
                    disabled={disabled || !onSlotClick}
                    on:click={() => onSlotClick?.(zone, slot)}
                >
                    {#if claimingPlayer && !showComparison}
                        <span class="text-yellow-300 text-[10px] truncate px-0.5">{claimingPlayer.slice(0, 3)}</span>
                    {:else if showComparison && targetColor}
                        <div class="w-2 h-2 rounded-full {colorClasses[targetColor]} opacity-50"></div>
                    {/if}
                </button>
            {/each}
        </div>
    {/each}
</div>
