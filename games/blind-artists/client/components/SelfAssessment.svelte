<script lang="ts">
    import { submitAction } from '$lib/stores/game';

    type Pigment = 'red' | 'yellow' | 'blue';

    export let currentAssessment: Pigment | 'unknown' = 'unknown';

    const options: (Pigment | 'unknown')[] = ['unknown', 'red', 'yellow', 'blue'];

    const labels: Record<Pigment | 'unknown', string> = {
        unknown: '?',
        red: 'R',
        yellow: 'Y',
        blue: 'B'
    };

    const colors: Record<Pigment | 'unknown', string> = {
        unknown: 'bg-gray-600 hover:bg-gray-500',
        red: 'bg-red-600 hover:bg-red-500',
        yellow: 'bg-yellow-500 hover:bg-yellow-400',
        blue: 'bg-blue-600 hover:bg-blue-500'
    };

    function selectPigment(pigment: Pigment | 'unknown') {
        currentAssessment = pigment;
        submitAction({ type: 'self-assessment', pigment });
    }
</script>

<div class="self-assessment">
    <p class="text-xs text-gray-400 mb-1">I think I am:</p>
    <div class="flex gap-1">
        {#each options as option}
            <button
                class="w-8 h-8 rounded-full font-bold text-sm transition-all
                    {colors[option]}
                    {currentAssessment === option ? 'ring-2 ring-white scale-110' : ''}"
                on:click={() => selectPigment(option)}
            >
                {labels[option]}
            </button>
        {/each}
    </div>
</div>
