<script lang="ts">
    export let roundData: {
        round: number;
        totalRounds: number;
        zones: number;
        revealedStrokes: Array<{ zoneId: number; color: string; round: number }>;
        publicClues: Array<{ type: string; text: string; round: number; isPublic: boolean }>;
    };

    export let publicState: {
        zones: number;
        revealedStrokes: Array<{ zoneId: number; color: string; round: number }>;
        strokesSubmitted: number;
        totalPlayers: number;
        round: number;
        publicClues: Array<{ type: string; text: string; round: number; isPublic: boolean }>;
    } | null = null;

    // Get color class for strokes
    function getColorClass(color: string): string {
        const colors: Record<string, string> = {
            red: 'bg-red-600',
            yellow: 'bg-yellow-500',
            blue: 'bg-blue-600',
            purple: 'bg-purple-600',
            green: 'bg-green-600',
            orange: 'bg-orange-500',
            black: 'bg-gray-900'
        };
        return colors[color] ?? 'bg-gray-500';
    }

    // Get color name with proper capitalization
    function getColorName(color: string): string {
        return color.charAt(0).toUpperCase() + color.slice(1);
    }

    // Get strokes for a specific zone
    function getZoneStrokes(zoneId: number) {
        return roundData.revealedStrokes.filter((s) => s.zoneId === zoneId);
    }

    // Calculate progress
    $: totalPerfectStrokes = roundData.revealedStrokes.length;
    $: progress = publicState
        ? `${publicState.strokesSubmitted}/${publicState.totalPlayers}`
        : '0/0';
</script>

<div class="card max-w-4xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
        <div>
            <h1 class="text-3xl font-bold text-primary-400">Blind Artists</h1>
            <p class="text-gray-400">Cooperative Painting Game</p>
        </div>
        <div class="text-right">
            <div class="text-2xl font-bold">Round {roundData.round}</div>
            <div class="text-gray-400">of {roundData.totalRounds}</div>
        </div>
    </div>

    <!-- Client Hints Section -->
    {#if roundData.publicClues.length > 0}
        <div class="bg-gray-800 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-semibold text-yellow-400 mb-3">
                The Client Says...
            </h2>
            <div class="space-y-2">
                {#each roundData.publicClues as clue}
                    <p class="text-lg italic text-gray-200">"{clue.text}"</p>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Canvas Visualization -->
    <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">The Canvas</h2>
        <div class="grid gap-4" style="grid-template-columns: repeat({Math.min(roundData.zones, 3)}, 1fr)">
            {#each Array(roundData.zones) as _, zoneId}
                {@const zoneStrokes = getZoneStrokes(zoneId)}
                <div class="bg-gray-700 rounded-lg p-4">
                    <h3 class="text-lg font-bold mb-2">Zone {zoneId + 1}</h3>

                    {#if zoneStrokes.length > 0}
                        <div class="space-y-2">
                            {#each zoneStrokes as stroke}
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-8 h-8 rounded-full {getColorClass(stroke.color)}"
                                        title={getColorName(stroke.color)}
                                    ></div>
                                    <span class="text-sm">
                                        {getColorName(stroke.color)}
                                        <span class="text-gray-400">(Round {stroke.round})</span>
                                    </span>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-gray-500 text-center py-4">
                            No perfect strokes yet
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </div>

    <!-- Progress -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center">
            <div>
                <div class="text-sm text-gray-400">Perfect Strokes</div>
                <div class="text-2xl font-bold text-green-400">
                    {totalPerfectStrokes}
                </div>
            </div>
            <div class="text-center">
                <div class="text-sm text-gray-400">Responses</div>
                <div class="text-2xl font-bold">{progress}</div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-400">Status</div>
                <div class="text-lg">
                    {#if publicState && publicState.strokesSubmitted === publicState.totalPlayers}
                        <span class="text-green-400">All submitted!</span>
                    {:else}
                        <span class="text-yellow-400">Waiting...</span>
                    {/if}
                </div>
            </div>
        </div>
    </div>

    <!-- Legend -->
    <div class="bg-gray-800 rounded-lg p-4">
        <h3 class="text-sm font-semibold text-gray-400 mb-2">Color Legend</h3>
        <div class="flex flex-wrap gap-3">
            {#each ['red', 'yellow', 'blue', 'purple', 'green', 'orange', 'black'] as color}
                <div class="flex items-center gap-1">
                    <div class="w-4 h-4 rounded-full {getColorClass(color)}"></div>
                    <span class="text-sm">{getColorName(color)}</span>
                </div>
            {/each}
        </div>
    </div>
</div>
