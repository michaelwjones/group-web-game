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

    const textColors: Record<Pigment | 'unknown', string> = {
        unknown: 'text-gray-300',
        red: 'text-red-400',
        yellow: 'text-yellow-400',
        blue: 'text-blue-400'
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
                    {textColors[option]}
                    {selected ? 'bg-gray-500 border-white scale-110 shadow-lg' : 'bg-gray-700 border-gray-600 scale-90 opacity-50'}"
                on:click={() => selectPigment(option)}
            >
                {labels[option]}
            </button>
        {/each}
    </div>
</div>
