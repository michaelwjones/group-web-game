<script lang="ts">
    import { submitResponse } from '$lib/stores/game';

    export let roundData: {
        question: string;
        options: string[];
        category: string;
        questionNumber: number;
        totalQuestions: number;
    };
    export let privateState: unknown = null;

    const optionLabels = ['A', 'B', 'C', 'D'];
    const optionColors = [
        'bg-red-600 hover:bg-red-700',
        'bg-blue-600 hover:bg-blue-700',
        'bg-yellow-600 hover:bg-yellow-700',
        'bg-green-600 hover:bg-green-700'
    ];

    function selectAnswer(index: number) {
        submitResponse(index);
    }
</script>

<div class="flex flex-col h-full">
    <div class="mb-4">
        <span class="text-primary-400 text-sm">{roundData.category}</span>
    </div>

    <div class="card mb-6">
        <p class="text-lg font-medium text-center">{roundData.question}</p>
    </div>

    <div class="flex-1 grid grid-cols-2 gap-3">
        {#each roundData.options as option, i}
            <button
                class="rounded-lg p-4 text-white font-bold text-lg transition-colors {optionColors[i]} flex flex-col items-center justify-center gap-2"
                on:click={() => selectAnswer(i)}
            >
                <span class="text-2xl">{optionLabels[i]}</span>
                <span class="text-sm text-center">{option}</span>
            </button>
        {/each}
    </div>
</div>
