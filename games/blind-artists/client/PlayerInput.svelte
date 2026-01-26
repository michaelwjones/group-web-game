<script lang="ts">
    import { submitResponse } from '$lib/stores/game';

    export let roundData: {
        round: number;
        totalRounds: number;
        zones: number;
        revealedStrokes: Array<{ zoneId: number; color: string; round: number }>;
        publicClues: Array<{ type: string; text: string; round: number; isPublic: boolean }>;
    };

    export let privateState: {
        brush: 'fine' | 'medium' | 'broad';
        constraint: 'left' | 'right' | 'neighbors' | 'self';
        seatPosition: number;
        clues: Array<{ type: string; text: string; round: number }>;
        seatOrder: string[];
        playerNames: Record<string, string>;
    } | null = null;

    // Selected zone
    let selectedZone: number | null = null;

    // Selected players
    let selectedPlayers: string[] = [];

    // Get the number of players to select based on brush
    $: brushPlayerCount = privateState
        ? privateState.brush === 'fine'
            ? 1
            : privateState.brush === 'medium'
              ? 2
              : 3
        : 1;

    // Get brush display info
    const brushInfo: Record<string, { name: string; description: string }> = {
        fine: { name: 'Fine Brush', description: 'Select 1 player' },
        medium: { name: 'Medium Brush', description: 'Select 2 adjacent players' },
        broad: { name: 'Broad Brush', description: 'Select 3 adjacent players' }
    };

    // Get constraint display info
    const constraintInfo: Record<string, { name: string; description: string }> = {
        left: { name: 'Left', description: 'Must select from players to your left' },
        right: { name: 'Right', description: 'Must select from players to your right' },
        neighbors: { name: 'Neighbors', description: 'Must select adjacent players' },
        self: { name: 'Self', description: 'Must include yourself' }
    };

    // Get color for display
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

    // Check if a player can be selected based on constraint
    function canSelectPlayer(playerId: string): boolean {
        if (!privateState) return false;

        const { constraint, seatPosition, seatOrder } = privateState;
        const playerPos = seatOrder.indexOf(playerId);
        const totalPlayers = seatOrder.length;
        const selfId = seatOrder[seatPosition];

        switch (constraint) {
            case 'self':
                // Can select self, or adjacent players
                if (playerId === selfId) return true;
                const distanceFromSelf = Math.min(
                    Math.abs(playerPos - seatPosition),
                    totalPlayers - Math.abs(playerPos - seatPosition)
                );
                return distanceFromSelf <= 1;

            case 'left':
                // Can select players to the left
                for (let i = 1; i <= brushPlayerCount; i++) {
                    const validPos = (seatPosition - i + totalPlayers) % totalPlayers;
                    if (playerPos === validPos) return true;
                }
                return false;

            case 'right':
                // Can select players to the right
                for (let i = 1; i <= brushPlayerCount; i++) {
                    const validPos = (seatPosition + i) % totalPlayers;
                    if (playerPos === validPos) return true;
                }
                return false;

            case 'neighbors':
                // Can select adjacent players
                const distance = Math.min(
                    Math.abs(playerPos - seatPosition),
                    totalPlayers - Math.abs(playerPos - seatPosition)
                );
                return distance <= 1;

            default:
                return true;
        }
    }

    // Toggle player selection
    function togglePlayer(playerId: string) {
        if (!canSelectPlayer(playerId)) return;

        const index = selectedPlayers.indexOf(playerId);
        if (index >= 0) {
            selectedPlayers = selectedPlayers.filter((id) => id !== playerId);
        } else if (selectedPlayers.length < brushPlayerCount) {
            selectedPlayers = [...selectedPlayers, playerId];
        }
    }

    // Check if selection is valid
    $: isValidSelection =
        selectedZone !== null &&
        selectedPlayers.length === brushPlayerCount &&
        (privateState?.constraint !== 'self' ||
            selectedPlayers.includes(privateState.seatOrder[privateState.seatPosition]));

    // Submit the action
    function submit() {
        if (!isValidSelection) return;
        submitResponse({
            zone: selectedZone,
            selectedPlayers
        });
    }

    // Get stroke count for a zone
    function getZoneStrokeCount(zoneId: number): number {
        return roundData.revealedStrokes.filter((s) => s.zoneId === zoneId).length;
    }
</script>

<div class="flex flex-col h-full gap-4">
    <!-- Header with brush and constraint info -->
    {#if privateState}
        <div class="card bg-gray-800 p-4">
            <div class="flex justify-between items-start gap-4">
                <div>
                    <div class="text-sm text-gray-400">Your Brush</div>
                    <div class="font-bold text-primary-400">
                        {brushInfo[privateState.brush].name}
                    </div>
                    <div class="text-sm text-gray-400">
                        {brushInfo[privateState.brush].description}
                    </div>
                </div>
                <div>
                    <div class="text-sm text-gray-400">Your Constraint</div>
                    <div class="font-bold text-yellow-400">
                        {constraintInfo[privateState.constraint].name}
                    </div>
                    <div class="text-sm text-gray-400">
                        {constraintInfo[privateState.constraint].description}
                    </div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Zone Selection -->
    <div class="card">
        <h3 class="text-lg font-semibold mb-3">Select Zone to Paint</h3>
        <div class="grid grid-cols-3 gap-2">
            {#each Array(roundData.zones) as _, i}
                <button
                    class="p-3 rounded-lg border-2 transition-colors {selectedZone === i
                        ? 'border-primary-500 bg-primary-600/20'
                        : 'border-gray-600 hover:border-gray-500'}"
                    on:click={() => (selectedZone = i)}
                >
                    <div class="font-bold">Zone {i + 1}</div>
                    <div class="text-sm text-gray-400">
                        {getZoneStrokeCount(i)} perfect
                    </div>
                    <!-- Show revealed strokes in this zone -->
                    {#if getZoneStrokeCount(i) > 0}
                        <div class="flex gap-1 mt-1 justify-center">
                            {#each roundData.revealedStrokes.filter((s) => s.zoneId === i) as stroke}
                                <div
                                    class="w-4 h-4 rounded-full {getColorClass(stroke.color)}"
                                    title={stroke.color}
                                ></div>
                            {/each}
                        </div>
                    {/if}
                </button>
            {/each}
        </div>
    </div>

    <!-- Player Selection -->
    {#if privateState}
        <div class="card flex-1 overflow-auto">
            <h3 class="text-lg font-semibold mb-1">Select Players for Stroke</h3>
            <p class="text-sm text-gray-400 mb-3">
                Select {brushPlayerCount} player{brushPlayerCount > 1 ? 's' : ''}.
                {#if privateState.constraint === 'self'}
                    <span class="text-yellow-400">(You must include yourself)</span>
                {/if}
            </p>

            <!-- Seating arrangement display -->
            <div class="space-y-1">
                {#each privateState.seatOrder as playerId, index}
                    {@const isSelf = index === privateState.seatPosition}
                    {@const canSelect = canSelectPlayer(playerId)}
                    {@const isSelected = selectedPlayers.includes(playerId)}
                    <button
                        class="w-full p-2 rounded-lg flex items-center gap-3 transition-colors
                            {isSelected
                            ? 'bg-primary-600 text-white'
                            : canSelect
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gray-800 opacity-50 cursor-not-allowed'}"
                        disabled={!canSelect}
                        on:click={() => togglePlayer(playerId)}
                    >
                        <span class="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                            {index + 1}
                        </span>
                        <span class="flex-1 text-left">
                            {privateState.playerNames[playerId] || 'Player'}
                            {#if isSelf}
                                <span class="text-yellow-400">(You)</span>
                            {/if}
                        </span>
                        {#if isSelected}
                            <span class="text-green-400">Selected</span>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Submit Button -->
    <button
        class="btn btn-primary w-full py-4 text-lg font-bold {isValidSelection
            ? ''
            : 'opacity-50 cursor-not-allowed'}"
        disabled={!isValidSelection}
        on:click={submit}
    >
        Paint Stroke
    </button>

    <!-- Validation feedback -->
    {#if selectedZone === null}
        <p class="text-center text-gray-400 text-sm">Select a zone first</p>
    {:else if selectedPlayers.length < brushPlayerCount}
        <p class="text-center text-gray-400 text-sm">
            Select {brushPlayerCount - selectedPlayers.length} more player{brushPlayerCount -
                selectedPlayers.length >
            1
                ? 's'
                : ''}
        </p>
    {:else if privateState?.constraint === 'self' && !selectedPlayers.includes(privateState.seatOrder[privateState.seatPosition])}
        <p class="text-center text-yellow-400 text-sm">You must include yourself (Self constraint)</p>
    {/if}
</div>
