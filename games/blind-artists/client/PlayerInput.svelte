<script lang="ts">
    import type { PlayerPublic } from '@game/shared';
    import { gameStore, players as playersStore, selfId as selfIdStore } from '$lib/stores/game';
    import FineBrushInput from './components/FineBrushInput.svelte';
    import ThickBrushInput from './components/ThickBrushInput.svelte';
    import PainterInput from './components/PainterInput.svelte';
    import LiaisonInput from './components/LiaisonInput.svelte';

    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
    type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let roundData: {
        roundNumber: number;
        totalRounds: number;
        canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
    };

    export let privateState: {
        role: Role;
        clue: string;
        liaisonElements?: { zone: Zone; element: string }[];
        sceneType?: string;
        feedback?: string[];
        freeFeedback?: string[];
    } | null = null;

    export let hasResponded: boolean = false;

    // Get public state from store
    $: publicState = $gameStore.playerState?.publicState as {
        canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
        pigmentUsesRemaining: Record<string, number>;
        selfAssessments: Record<string, Pigment | 'unknown'>;
        roles: Record<string, Role>;
        seatingOrder: string[];
        roundNumber: number;
        totalRounds: number;
        submittedPlayers: string[];
        slotClaims: Record<string, { zone: Zone; slot: SlotType } | null>;
    } | null;

    $: players = $playersStore as PlayerPublic[];
    $: selfId = $selfIdStore || '';
    $: role = privateState?.role || 'painter';

    // Extract needed data
    $: seatingOrder = publicState?.seatingOrder || [];
    $: roles = publicState?.roles || {};
    $: pigmentUsesRemaining = publicState?.pigmentUsesRemaining || {};
    $: selfAssessments = publicState?.selfAssessments || {};
    $: canvasOccupied = publicState?.canvasOccupied || roundData.canvasOccupied;
    $: slotClaims = publicState?.slotClaims || {};
</script>

<div class="player-input h-full flex flex-col">
    <!-- Starting clue (shown once at top) -->
    {#if privateState?.clue}
        <div class="p-2 bg-gray-800 border-b border-gray-700">
            <p class="text-xs text-gray-400">Your clue:</p>
            <p class="text-sm text-primary-300 italic">"{privateState.clue}"</p>
        </div>
    {/if}

    <!-- Role-specific input -->
    <div class="flex-1 overflow-auto">
        {#if role === 'fine-brush'}
            <FineBrushInput
                {players}
                {seatingOrder}
                {roles}
                {pigmentUsesRemaining}
                {selfAssessments}
                {selfId}
            />
        {:else if role === 'thick-brush'}
            <ThickBrushInput
                {players}
                {seatingOrder}
                {roles}
                {pigmentUsesRemaining}
                {selfAssessments}
                {selfId}
            />
        {:else if role === 'painter'}
            <PainterInput
                {players}
                {seatingOrder}
                {roles}
                {pigmentUsesRemaining}
                {selfAssessments}
                {selfId}
                {canvasOccupied}
                {slotClaims}
            />
        {:else if role === 'liaison'}
            <LiaisonInput
                {selfId}
                {selfAssessments}
                liaisonElements={privateState?.liaisonElements || []}
                sceneType={privateState?.sceneType || 'Landscape'}
                feedback={privateState?.feedback || []}
                freeFeedback={privateState?.freeFeedback || []}
            />
        {:else}
            <div class="p-4 text-center text-gray-400">
                Unknown role: {role}
            </div>
        {/if}
    </div>
</div>
