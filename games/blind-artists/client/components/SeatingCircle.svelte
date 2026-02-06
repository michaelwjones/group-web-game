<script lang="ts">
    import type { PlayerPublic } from '@game/shared';

    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let players: PlayerPublic[] = [];
    export let seatingOrder: string[] = [];
    export let roles: Record<string, Role> = {};
    export let pigmentUsesRemaining: Record<string, number> = {};
    export let selfAssessments: Record<string, Pigment | 'unknown'> = {};
    export let selfId: string | null = null;
    export let onPlayerClick: ((playerId: string) => void) | null = null;
    export let selectedPlayers: string[] = [];
    export let disabledPlayers: string[] = [];
    export let compact: boolean = false;

    const roleIcons: Record<Role, string> = {
        'fine-brush': '🖌️',
        'thick-brush': '🖼️',
        'painter': '🎨',
        'liaison': '📡'
    };

    const roleColors: Record<Role, string> = {
        'fine-brush': 'border-blue-400',
        'thick-brush': 'border-purple-400',
        'painter': 'border-green-400',
        'liaison': 'border-yellow-400'
    };

    const pigmentColors: Record<Pigment | 'unknown', string> = {
        red: 'bg-red-500',
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500',
        unknown: 'bg-gray-600'
    };

    function getPlayerName(playerId: string): string {
        const player = players.find(p => p.id === playerId);
        return player?.name || playerId;
    }

    function isSelected(playerId: string): boolean {
        return selectedPlayers.includes(playerId);
    }

    function isDisabled(playerId: string): boolean {
        return disabledPlayers.includes(playerId);
    }

    // Calculate positions in a circle
    function getPlayerPosition(index: number, total: number): { x: number; y: number } {
        const angle = (2 * Math.PI * index) / total - Math.PI / 2; // Start from top
        const radius = compact ? 35 : 40; // percentage
        return {
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle)
        };
    }
</script>

<div class="relative w-full aspect-square max-w-md mx-auto">
    {#each seatingOrder as playerId, index}
        {@const pos = getPlayerPosition(index, seatingOrder.length)}
        {@const role = roles[playerId]}
        {@const uses = pigmentUsesRemaining[playerId] ?? 5}
        {@const assessment = selfAssessments[playerId] || 'unknown'}
        {@const selected = isSelected(playerId)}
        {@const disabled = isDisabled(playerId)}
        {@const isSelf = playerId === selfId}

        <button
            class="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all
                {compact ? 'w-12 h-12' : 'w-16 h-16'}
                rounded-full border-2
                {role ? roleColors[role] : 'border-gray-500'}
                {selected ? 'ring-4 ring-primary-400 scale-110' : ''}
                {disabled ? 'opacity-40' : ''}
                {isSelf ? 'ring-2 ring-white' : ''}
                {onPlayerClick && !disabled ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                bg-gray-800 flex flex-col items-center justify-center p-1"
            style="left: {pos.x}%; top: {pos.y}%"
            disabled={disabled || !onPlayerClick}
            on:click={() => onPlayerClick?.(playerId)}
        >
            <!-- Role icon -->
            {#if role && !compact}
                <span class="text-sm">{roleIcons[role]}</span>
            {/if}

            <!-- Player name -->
            <span class="text-xs font-medium truncate max-w-full px-1
                {isSelf ? 'text-primary-300' : 'text-white'}">
                {getPlayerName(playerId).slice(0, compact ? 3 : 6)}
            </span>

            <!-- Pigment uses -->
            {#if !compact}
                <span class="text-[10px] text-gray-400">{uses} left</span>
            {/if}

            <!-- Self-assessment dot -->
            <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-gray-700
                {pigmentColors[assessment]}"
            ></div>
        </button>
    {/each}

    <!-- Center info -->
    <div class="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <slot name="center"></slot>
    </div>
</div>
