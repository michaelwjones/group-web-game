<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { gameStore, createGame, joinGame } from '$lib/stores/game';
    import { lastError } from '$lib/stores/connection';
    import GameSelector from '$lib/components/home/GameSelector.svelte';

    let joinCode = '';
    let playerName = '';
    let mode: 'menu' | 'select-game' | 'join' | 'create' | 'enter-name' = 'menu';
    let selectedGameType = '';
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
        mode = 'select-game';
        lastError.set(null);
    }

    function handleGameSelected(event: CustomEvent<string>) {
        selectedGameType = event.detail;
        mode = 'create';
    }

    function handleCreateAsDisplay() {
        createGame(selectedGameType);
    }

    function handleChoosePlayer() {
        mode = 'enter-name';
    }

    function handleCreateAsPlayer() {
        if (playerName.trim()) {
            createGame(selectedGameType, playerName.trim());
        }
    }

    function handleJoinGame() {
        if (joinCode.length >= 4 && playerName.trim()) {
            joinGame(joinCode, playerName.trim());
        }
    }

    function resetMode() {
        mode = 'menu';
        selectedGameType = '';
        lastError.set(null);
        joinCode = '';
        playerName = '';
    }
</script>

<div class="flex items-center justify-center min-h-screen p-4">
    <div class="card max-w-md w-full text-center">
        <h1 class="text-4xl font-bold mb-8 text-primary-400">Group Web Game</h1>

        {#if mode === 'menu'}
            <div class="space-y-4">
                <button class="btn btn-primary btn-lg w-full" on:click={handleNewGame}>
                    New Game
                </button>
                <button class="btn btn-secondary btn-lg w-full" on:click={() => (mode = 'join')}>
                    Join Game
                </button>
            </div>
        {:else if mode === 'select-game'}
            <GameSelector on:select={handleGameSelected} on:back={resetMode} />
        {:else if mode === 'create'}
            <div class="space-y-4">
                <p class="text-gray-400 mb-4">How do you want to play?</p>
                <button class="btn btn-primary btn-lg w-full" on:click={handleCreateAsDisplay}>
                    Be the Display
                </button>
                <p class="text-sm text-gray-500 -mt-2 mb-4">Show the game on a shared screen (TV/projector)</p>
                <button class="btn btn-primary btn-lg w-full" on:click={handleChoosePlayer}>
                    Be a Player
                </button>
                <p class="text-sm text-gray-500 -mt-2 mb-2">Play from your device, no shared screen needed</p>
                <button type="button" class="btn btn-secondary w-full mt-4" on:click={() => (mode = 'select-game')}>
                    Back
                </button>
            </div>
        {:else if mode === 'enter-name'}
            <div class="space-y-4">
                <p class="text-gray-400 mb-4">Enter your name to start</p>
                <div>
                    <input
                        id="hostName"
                        type="text"
                        class="input"
                        bind:value={playerName}
                        maxlength="20"
                        placeholder="Your name"
                        autocomplete="off"
                    />
                </div>
                <div class="flex gap-2">
                    <button type="button" class="btn btn-secondary flex-1" on:click={() => (mode = 'create')}>
                        Back
                    </button>
                    <button
                        class="btn btn-primary flex-1"
                        on:click={handleCreateAsPlayer}
                        disabled={!playerName.trim()}
                    >
                        Start Game
                    </button>
                </div>
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
