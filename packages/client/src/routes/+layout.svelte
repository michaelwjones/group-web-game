<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { initializeGame } from '$lib/stores/game';
    import { parseTestModeParams, isTestMode } from '$lib/stores/test-mode';
    import ConnectionStatus from '$lib/components/shared/ConnectionStatus.svelte';

    onMount(() => {
        // Parse test mode params first (before game initialization uses session storage)
        parseTestModeParams();
        initializeGame();
    });
</script>

<div class="min-h-screen flex flex-col">
    {#if !$isTestMode}
        <ConnectionStatus />
    {/if}
    <main class="flex-1">
        <slot />
    </main>
</div>
