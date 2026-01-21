<script lang="ts">
    import '../app.css';
    import { onMount } from 'svelte';
    import { initializeGame } from '$lib/stores/game';
    import ConnectionStatus from '$lib/components/shared/ConnectionStatus.svelte';

    onMount(() => {
        initializeGame();
    });
</script>

<div class="min-h-screen flex flex-col">
    <ConnectionStatus />
    <main class="flex-1">
        <slot />
    </main>
</div>
