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
        unknown: 'bg-gray-600',
        red: 'bg-red-600',
        yellow: 'bg-yellow-500',
        blue: 'bg-blue-600'
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
                class="w-9 h-9 rounded-full font-bold text-sm transition-all
                    {colors[option]}
                    {selected ? 'ring-3 ring-white scale-110 shadow-lg' : 'opacity-40 scale-90'}"
                on:click={() => selectPigment(option)}
            >
                {labels[option]}
            </button>
        {/each}
    </div>
</div>
