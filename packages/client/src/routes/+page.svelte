<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { gameStore, createGame, joinGame } from '$lib/stores/game';
    import { lastError } from '$lib/stores/connection';

    let joinCode = '';
    let playerName = '';
    let mode: 'menu' | 'join' | 'create' = 'menu';
    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    $: if (mounted && $gameStore.viewMode === 'display' && $gameStore.gameCode) {
        goto(`${base}/display/${$gameStore.gameCode}`);
    }

    $: if (mounted && $gameStore.viewMode === 'player' && $gameStore.gameCode) {
        goto(`${base}/play/${$gameStore.gameCode}`);
    }

    function handleNewGame() {
        mode = 'create';
        lastError.set(null);
    }

    function handleCreateAsDisplay() {
        createGame('trivia');
    }

    function handleCreateAsHost() {
        if (playerName.trim()) {
            createGame('trivia', playerName.trim());
        }
    }

    function handleJoinGame() {
        if (joinCode.length >= 4 && playerName.trim()) {
            joinGame(joinCode, playerName.trim());
        }
    }

    function resetMode() {
        mode = 'menu';
        lastError.set(null);
        joinCode = '';
        playerName = '';
    }
</script>

<div class="flex items-center justify-center min-h-screen p-4">
    <div class="card max-w-md w-full text-center">
        <h1 class="text-4xl font-bold mb-8 text-primary-400">Game Night</h1>

        {#if mode === 'menu'}
            <div class="space-y-4">
                <button class="btn btn-primary btn-lg w-full" on:click={handleNewGame}>
                    New Game
                </button>
                <button class="btn btn-secondary btn-lg w-full" on:click={() => (mode = 'join')}>
                    Join Game
                </button>
            </div>
        {:else if mode === 'create'}
            <div class="space-y-4">
                <p class="text-gray-400 mb-4">How do you want to run this game?</p>
                <button class="btn btn-primary btn-lg w-full" on:click={handleCreateAsDisplay}>
                    Be the Display
                </button>
                <p class="text-sm text-gray-500 -mt-2 mb-2">Show questions on a shared screen</p>
                <div class="border-t border-gray-700 my-4"></div>
                <div>
                    <label for="hostName" class="block text-sm text-gray-400 mb-1">Your Name</label>
                    <input
                        id="hostName"
                        type="text"
                        class="input"
                        bind:value={playerName}
                        maxlength="20"
                        placeholder="Enter your name"
                        autocomplete="off"
                    />
                </div>
                <button
                    class="btn btn-secondary btn-lg w-full"
                    on:click={handleCreateAsHost}
                    disabled={!playerName.trim()}
                >
                    Be a Host
                </button>
                <p class="text-sm text-gray-500 -mt-2 mb-2">Play from your device, no shared screen</p>
                <button type="button" class="btn btn-secondary flex-1 w-full mt-4" on:click={resetMode}>
                    Back
                </button>
            </div>
        {:else if mode === 'join'}
            <form on:submit|preventDefault={handleJoinGame} class="space-y-4">
                <div>
                    <label for="joinCode" class="block text-sm text-gray-400 mb-1">Game Code</label>
                    <input
                        id="joinCode"
                        type="text"
                        class="input text-center text-2xl uppercase tracking-widest"
                        bind:value={joinCode}
                        maxlength="4"
                        placeholder="ABCD"
                        autocomplete="off"
                    />
                </div>
                <div>
                    <label for="playerName" class="block text-sm text-gray-400 mb-1">Your Name</label>
                    <input
                        id="playerName"
                        type="text"
                        class="input"
                        bind:value={playerName}
                        maxlength="20"
                        placeholder="Enter your name"
                        autocomplete="off"
                    />
                </div>
                <div class="flex gap-2">
                    <button type="button" class="btn btn-secondary flex-1" on:click={resetMode}>
                        Back
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary flex-1"
                        disabled={joinCode.length < 4 || !playerName.trim()}
                    >
                        Join
                    </button>
                </div>
            </form>
        {/if}

        {#if $lastError}
            <p class="mt-4 text-red-400 text-sm">{$lastError.message}</p>
        {/if}
    </div>
</div>
