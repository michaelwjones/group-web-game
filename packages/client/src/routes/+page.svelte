<script lang="ts">
    import { goto } from '$app/navigation';
    import { gameStore, createGame, joinGame, joinAsDisplay } from '$lib/stores/game';
    import { lastError } from '$lib/stores/connection';

    let joinCode = '';
    let playerName = '';
    let mode: 'menu' | 'join' | 'display' = 'menu';

    $: if ($gameStore.viewMode === 'display' && $gameStore.gameCode) {
        goto(`/display/${$gameStore.gameCode}`);
    }

    $: if ($gameStore.viewMode === 'player' && $gameStore.gameCode) {
        goto(`/play/${$gameStore.gameCode}`);
    }

    function handleCreateGame() {
        createGame('trivia');
    }

    function handleJoinGame() {
        if (joinCode.length >= 4 && playerName.trim()) {
            joinGame(joinCode, playerName.trim());
        }
    }

    function handleJoinDisplay() {
        if (joinCode.length >= 4) {
            joinAsDisplay(joinCode);
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
                <button class="btn btn-primary btn-lg w-full" on:click={handleCreateGame}>
                    New Game
                </button>
                <button class="btn btn-secondary btn-lg w-full" on:click={() => (mode = 'join')}>
                    Join Game
                </button>
                <button class="btn btn-secondary btn-lg w-full" on:click={() => (mode = 'display')}>
                    Join as Display
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
        {:else if mode === 'display'}
            <form on:submit|preventDefault={handleJoinDisplay} class="space-y-4">
                <div>
                    <label for="displayCode" class="block text-sm text-gray-400 mb-1">Game Code</label>
                    <input
                        id="displayCode"
                        type="text"
                        class="input text-center text-2xl uppercase tracking-widest"
                        bind:value={joinCode}
                        maxlength="4"
                        placeholder="ABCD"
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
                        disabled={joinCode.length < 4}
                    >
                        Connect Display
                    </button>
                </div>
            </form>
        {/if}

        {#if $lastError}
            <p class="mt-4 text-red-400 text-sm">{$lastError.message}</p>
        {/if}
    </div>
</div>
