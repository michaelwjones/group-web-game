<script lang="ts">
    import { connectionState, connectionStatus, lastError } from '$lib/websocket/client';
    import { onMount } from 'svelte';

    let dots = '';
    let showingColdStart = false;

    // Animate dots
    onMount(() => {
        const interval = setInterval(() => {
            dots = dots.length >= 3 ? '' : dots + '.';
        }, 500);
        return () => clearInterval(interval);
    });

    // Show cold start message after a few seconds of connecting
    $: if ($connectionStatus.isInitialConnection && $connectionStatus.attemptCount > 2) {
        showingColdStart = true;
    } else if ($connectionState === 'connected') {
        showingColdStart = false;
    }
</script>

{#if $connectionState === 'connecting' && $connectionStatus.isInitialConnection}
    <div class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        <div class="text-center p-8 max-w-md">
            <div class="mb-6">
                <div class="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 class="text-xl font-semibold mb-2">Connecting to server{dots}</h2>
            {#if showingColdStart}
                <p class="text-gray-400 text-sm">
                    The server is waking up. This can take up to 30 seconds on first load.
                </p>
                <p class="text-gray-500 text-xs mt-2">
                    Attempt {$connectionStatus.attemptCount}
                </p>
            {:else}
                <p class="text-gray-400 text-sm">Please wait...</p>
            {/if}
        </div>
    </div>
{:else if $connectionState === 'reconnecting'}
    <div class="fixed top-0 left-0 right-0 bg-yellow-600 text-white text-center py-2 text-sm z-50">
        Reconnecting to server{dots}
    </div>
{:else if $connectionState === 'disconnected'}
    <div class="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
        Disconnected from server
    </div>
{/if}

{#if $lastError && $connectionState === 'connected'}
    <div class="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm z-50">
        {$lastError.message}
    </div>
{/if}
