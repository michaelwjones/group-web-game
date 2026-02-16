<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { createEventDispatcher, onMount } from 'svelte';

    export let players: PlayerPublic[] = [];
    export let selfId: string = '';
    export let hostId: string | null = null;

    const dispatch = createEventDispatcher<{ change: string[] }>();

    // Ordered player IDs — initialize from players prop
    let orderedIds: string[] = players.map(p => p.id);

    // Emit initial order once mounted
    onMount(() => {
        dispatch('change', orderedIds);
    });

    // Keep in sync when players join/leave
    $: {
        const currentSet = new Set(orderedIds);
        const playerSet = new Set(players.map(p => p.id));
        let changed = false;
        // Add new players at the end
        for (const p of players) {
            if (!currentSet.has(p.id)) {
                orderedIds = [...orderedIds, p.id];
                changed = true;
            }
        }
        // Remove players who left
        const filtered = orderedIds.filter(id => playerSet.has(id));
        if (filtered.length !== orderedIds.length) {
            orderedIds = filtered;
            changed = true;
        }
        if (changed) {
            dispatch('change', orderedIds);
        }
    }

    $: orderedPlayers = orderedIds.map(id => players.find(p => p.id === id)!).filter(Boolean);

    // Drag state
    let dragIndex: number | null = null;
    let dragOverIndex: number | null = null;
    let dragging = false;
    let dragStartY = 0;
    let dragCurrentY = 0;
    let itemHeight = 52; // approx row height
    let listEl: HTMLDivElement;

    function onPointerDown(e: PointerEvent, index: number) {
        e.preventDefault();
        dragging = true;
        dragIndex = index;
        dragOverIndex = index;
        dragStartY = e.clientY;
        dragCurrentY = e.clientY;

        // Measure actual item height
        const items = listEl?.querySelectorAll('[data-seat-item]');
        if (items && items.length > 0) {
            itemHeight = (items[0] as HTMLElement).offsetHeight + 8; // gap
        }

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: PointerEvent) {
        if (!dragging || dragIndex === null) return;
        e.preventDefault();
        dragCurrentY = e.clientY;

        const delta = dragCurrentY - dragStartY;
        const indexOffset = Math.round(delta / itemHeight);
        const newOver = Math.max(0, Math.min(orderedIds.length - 1, dragIndex + indexOffset));
        if (newOver !== dragOverIndex) {
            dragOverIndex = newOver;
        }
    }

    function onPointerUp(e: PointerEvent) {
        if (!dragging || dragIndex === null || dragOverIndex === null) {
            dragging = false;
            dragIndex = null;
            dragOverIndex = null;
            return;
        }

        if (dragIndex !== dragOverIndex) {
            const newOrder = [...orderedIds];
            const [moved] = newOrder.splice(dragIndex, 1);
            newOrder.splice(dragOverIndex, 0, moved);
            orderedIds = newOrder;
            dispatch('change', orderedIds);
        }

        dragging = false;
        dragIndex = null;
        dragOverIndex = null;
    }

    // Visual index during drag: compute display order
    function getDisplayIndex(visualIndex: number): number {
        if (!dragging || dragIndex === null || dragOverIndex === null) return visualIndex;
        if (visualIndex === dragIndex) return dragOverIndex;
        if (dragIndex < dragOverIndex) {
            if (visualIndex > dragIndex && visualIndex <= dragOverIndex) return visualIndex - 1;
        } else {
            if (visualIndex >= dragOverIndex && visualIndex < dragIndex) return visualIndex + 1;
        }
        return visualIndex;
    }

    $: dragOffsetY = dragging ? dragCurrentY - dragStartY : 0;
</script>

<div class="space-y-3">
    <!-- Info banner -->
    <div class="bg-blue-900/40 border border-blue-700/50 rounded-lg p-3 text-sm text-blue-200">
        Arrange the seating circle. Order matters — clues and abilities depend on who sits next to whom.
    </div>

    <!-- Drag list -->
    <div
        class="space-y-2 select-none"
        bind:this={listEl}
        on:pointermove={onPointerMove}
        on:pointerup={onPointerUp}
    >
        {#each orderedPlayers as player, index (player.id)}
            {@const isDragged = dragging && dragIndex === index}
            {@const displayIdx = getDisplayIndex(index)}
            <div
                data-seat-item
                class="flex items-center gap-2 p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing touch-none
                    {isDragged ? 'bg-primary-700 shadow-lg z-10 relative' : 'bg-gray-700'}
                    {dragging && !isDragged && dragOverIndex === index ? 'border-t-2 border-primary-400' : ''}"
                style="{isDragged ? `transform: translateY(${dragOffsetY}px);` : ''}"
                on:pointerdown={(e) => onPointerDown(e, index)}
            >
                <!-- Position number -->
                <span class="text-gray-400 text-sm font-mono w-5 text-right shrink-0">
                    {displayIdx + 1}
                </span>

                <!-- Drag handle icon -->
                <span class="text-gray-500 text-lg leading-none">&#x2807;</span>

                <!-- Player name -->
                <span class="font-medium flex-1 truncate">{player.name}</span>

                <!-- Badges -->
                {#if player.id === hostId}
                    <span class="text-xs bg-primary-600 px-2 py-0.5 rounded shrink-0">Host</span>
                {/if}
                {#if player.id === selfId}
                    <span class="text-xs bg-gray-600 px-2 py-0.5 rounded shrink-0">You</span>
                {/if}
            </div>
        {/each}
    </div>

</div>
