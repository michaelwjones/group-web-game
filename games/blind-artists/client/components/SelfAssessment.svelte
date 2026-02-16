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

    const selectedColors: Record<Pigment | 'unknown', string> = {
        unknown: 'bg-gray-500 border-white',
        red: 'bg-red-600 border-white',
        yellow: 'bg-yellow-500 border-white',
        blue: 'bg-blue-600 border-white'
    };

    const unselectedColors: Record<Pigment | 'unknown', string> = {
        unknown: 'bg-gray-700 border-gray-600',
        red: 'bg-gray-700 border-red-800',
        yellow: 'bg-gray-700 border-yellow-800',
        blue: 'bg-gray-700 border-blue-800'
    };

    function selectPigment(pigment: Pigment | 'unknown') {
        currentAssessment = pigment;
        submitAction({ type: 'self-assessment', pigment });
    }
</script>

<div class="self-assessment">
    <p class="text-xs text-gray-400 mb-1">I think I am:</p>
    <div class="flex gap-2">
        {#each options as option}
            {@const selected = currentAssessment === option}
            <button
                class="w-9 h-9 rounded-full font-bold text-sm transition-all border-2
                    {selected ? selectedColors[option] : unselectedColors[option]}
                    {selected ? 'scale-110 shadow-lg text-white' : 'scale-90 text-gray-500'}"
                on:click={() => selectPigment(option)}
            >
                {labels[option]}
            </button>
        {/each}
    </div>
</div>
