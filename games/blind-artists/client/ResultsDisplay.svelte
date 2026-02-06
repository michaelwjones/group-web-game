<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { players as playersStore } from '$lib/stores/game';
    import CanvasGrid from './components/CanvasGrid.svelte';

    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
    type Color = 'red' | 'yellow' | 'blue' | 'orange' | 'green' | 'purple';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let results: {
        tier: 'masterpiece' | 'impressed' | 'satisfied' | 'rejected';
        correctSlots: number;
        totalSlots: number;
        target: Record<Zone, Record<SlotType, Color>>;
        canvas: Record<Zone, Record<SlotType, Color | null>>;
        elements: Record<Zone, string>;
        pigmentAssignments: Record<string, Pigment>;
    };

    $: players = $playersStore as PlayerPublic[];
    $: playerNames = Object.fromEntries(players.map(p => [p.id, p.name]));

    const tierMessages: Record<string, { title: string; emoji: string; color: string }> = {
        masterpiece: { title: 'MASTERPIECE!', emoji: '🏆', color: 'text-yellow-400' },
        impressed: { title: 'Impressed!', emoji: '🌟', color: 'text-green-400' },
        satisfied: { title: 'Satisfied', emoji: '👍', color: 'text-blue-400' },
        rejected: { title: 'Rejected', emoji: '😔', color: 'text-red-400' }
    };

    $: tierInfo = tierMessages[results.tier];

    // Create occupied map from canvas
    $: canvasOccupied = Object.fromEntries(
        Object.entries(results.canvas).map(([zone, slots]) => [
            zone,
            Object.fromEntries(
                Object.entries(slots).map(([slot, color]) => [slot, color !== null])
            )
        ])
    ) as Record<Zone, Record<SlotType, boolean>>;

    const zones: Zone[] = ['back', 'mid', 'fore', 'focus'];

    const pigmentColors: Record<Pigment, string> = {
        red: 'bg-red-500',
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500'
    };

    function capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
</script>

<div class="results-display p-4">
    <!-- Tier Result Banner -->
    <div class="text-center mb-6">
        <span class="text-6xl">{tierInfo.emoji}</span>
        <h2 class="text-3xl font-bold {tierInfo.color}">{tierInfo.title}</h2>
        <p class="text-xl text-gray-300">
            {results.correctSlots}/{results.totalSlots} slots correct
        </p>
    </div>

    <!-- Side by side comparison -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Your Canvas -->
        <div class="card">
            <h3 class="text-lg font-bold mb-2 text-center">Your Painting</h3>
            <CanvasGrid
                {canvasOccupied}
                canvasColors={results.canvas}
                targetColors={results.target}
                showComparison={true}
            />
        </div>

        <!-- Target -->
        <div class="card">
            <h3 class="text-lg font-bold mb-2 text-center">The Target</h3>
            <CanvasGrid
                canvasOccupied={Object.fromEntries(
                    zones.map(z => [z, { primary: true, secondary: true, highlight: true, shadow: true }])
                ) as Record<Zone, Record<SlotType, boolean>>}
                canvasColors={results.target}
                showComparison={false}
            />
        </div>
    </div>

    <!-- Elements -->
    <div class="card mb-6">
        <h3 class="text-lg font-bold mb-2">The Scene</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each zones as zone}
                <div class="text-center">
                    <p class="text-xs text-gray-400">{capitalize(zone)}</p>
                    <p class="font-medium">{results.elements[zone]}</p>
                </div>
            {/each}
        </div>
    </div>

    <!-- Pigment Assignments -->
    <div class="card">
        <h3 class="text-lg font-bold mb-2">Pigment Assignments</h3>
        <div class="flex flex-wrap gap-2 justify-center">
            {#each Object.entries(results.pigmentAssignments) as [playerId, pigment]}
                <div class="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded">
                    <div class="w-3 h-3 rounded-full {pigmentColors[pigment]}"></div>
                    <span class="text-sm">{playerNames[playerId] || playerId}</span>
                </div>
            {/each}
        </div>
    </div>
</div>
