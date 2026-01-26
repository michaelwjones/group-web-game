<script lang="ts">
    import type { RoundResults } from '@game/shared';

    export let results: RoundResults<{
        round: number;
        newPerfectStrokes: Array<{ zoneId: number; color: string; round: number }>;
        allPerfectStrokes: Array<{ zoneId: number; color: string; round: number }>;
        clientHints: Array<{ type: string; text: string; round: number; isPublic: boolean }>;
        strokesAttempted: number;
        gameWon: boolean;
    }>;

    $: gameResults = results.results;

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

    // Get color name
    function getColorName(color: string): string {
        return color.charAt(0).toUpperCase() + color.slice(1);
    }

    // Group strokes by zone
    function groupByZone(strokes: Array<{ zoneId: number; color: string; round: number }>) {
        const grouped: Record<number, typeof strokes> = {};
        for (const stroke of strokes) {
            if (!grouped[stroke.zoneId]) {
                grouped[stroke.zoneId] = [];
            }
            grouped[stroke.zoneId].push(stroke);
        }
        return grouped;
    }

    $: allStrokesByZone = groupByZone(gameResults.allPerfectStrokes);
</script>

<div class="card">
    <!-- Win/Progress Header -->
    {#if gameResults.gameWon}
        <div class="text-center mb-6 py-4 bg-green-600/20 rounded-lg">
            <h2 class="text-3xl font-bold text-green-400 mb-2">Masterpiece Complete!</h2>
            <p class="text-lg text-gray-300">
                The team has successfully painted the client's vision!
            </p>
        </div>
    {:else}
        <h2 class="text-2xl font-bold text-center mb-6">Round {gameResults.round} Results</h2>
    {/if}

    <!-- New Perfect Strokes -->
    {#if gameResults.newPerfectStrokes.length > 0}
        <div class="bg-green-600/10 border border-green-600 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-green-400 mb-3">
                New Perfect Strokes!
            </h3>
            <div class="flex flex-wrap gap-3">
                {#each gameResults.newPerfectStrokes as stroke}
                    <div class="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                        <div class="w-6 h-6 rounded-full {getColorClass(stroke.color)}"></div>
                        <span>
                            Zone {stroke.zoneId + 1}: {getColorName(stroke.color)}
                        </span>
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div class="bg-gray-700 rounded-lg p-4 mb-6 text-center">
            <p class="text-gray-400">No perfect strokes this round</p>
            <p class="text-sm text-gray-500 mt-1">
                Keep experimenting! Listen to the client's feedback.
            </p>
        </div>
    {/if}

    <!-- Overall Progress -->
    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-3">Canvas Progress</h3>
        <div class="grid gap-4" style="grid-template-columns: repeat({Math.min(Object.keys(allStrokesByZone).length || 3, 3)}, 1fr)">
            {#each Object.entries(allStrokesByZone) as [zoneId, strokes]}
                <div class="bg-gray-700 rounded-lg p-3">
                    <h4 class="font-bold mb-2">Zone {Number(zoneId) + 1}</h4>
                    <div class="space-y-1">
                        {#each strokes as stroke}
                            <div class="flex items-center gap-2">
                                <div class="w-4 h-4 rounded-full {getColorClass(stroke.color)}"></div>
                                <span class="text-sm">{getColorName(stroke.color)}</span>
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
            {#if Object.keys(allStrokesByZone).length === 0}
                <div class="col-span-3 text-center text-gray-500 py-4">
                    No perfect strokes revealed yet
                </div>
            {/if}
        </div>
    </div>

    <!-- Client Hints for Next Round -->
    {#if gameResults.clientHints.length > 0 && !gameResults.gameWon}
        <div class="bg-yellow-600/10 border border-yellow-600 rounded-lg p-4 mb-6">
            <h3 class="text-lg font-semibold text-yellow-400 mb-3">
                Client Feedback
            </h3>
            <div class="space-y-2">
                {#each gameResults.clientHints as hint}
                    <p class="italic text-gray-200">"{hint.text}"</p>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Stats -->
    <div class="bg-gray-800 rounded-lg p-4">
        <div class="flex justify-between text-center">
            <div>
                <div class="text-2xl font-bold text-primary-400">
                    {gameResults.strokesAttempted}
                </div>
                <div class="text-sm text-gray-400">Strokes Attempted</div>
            </div>
            <div>
                <div class="text-2xl font-bold text-green-400">
                    {gameResults.newPerfectStrokes.length}
                </div>
                <div class="text-sm text-gray-400">Perfect This Round</div>
            </div>
            <div>
                <div class="text-2xl font-bold">
                    {gameResults.allPerfectStrokes.length}
                </div>
                <div class="text-sm text-gray-400">Total Perfect</div>
            </div>
        </div>
    </div>

    <!-- Score Changes -->
    {#if Object.keys(results.scoreChanges).length > 0}
        <div class="mt-4 text-center text-sm text-gray-400">
            {#if results.scoreChanges[Object.keys(results.scoreChanges)[0]] > 0}
                +{results.scoreChanges[Object.keys(results.scoreChanges)[0]]} points for everyone!
            {/if}
        </div>
    {/if}
</div>
