<script lang="ts">
    import { submitResponse, gameStore } from '$lib/stores/game';

    export let roundData: {
        question: string;
        options: string[];
        category: string;
        questionNumber: number;
        totalQuestions: number;
    };
    export let privateState: unknown = null;
    export let hasResponded: boolean = false;

    const optionLabels = ['A', 'B', 'C', 'D'];
    const baseColors = [
        { bg: 'bg-red-600', hover: 'hover:bg-red-700', selected: 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' },
        { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', selected: 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' },
        { bg: 'bg-yellow-600', hover: 'hover:bg-yellow-700', selected: 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' },
        { bg: 'bg-green-600', hover: 'hover:bg-green-700', selected: 'ring-4 ring-white ring-offset-2 ring-offset-gray-900' }
    ];

    let selectedAnswer: number | null = null;

    function selectAnswer(index: number) {
        selectedAnswer = index;
        submitResponse(index);
    }

    function getButtonClass(index: number): string {
        const color = baseColors[index];
        const isSelected = selectedAnswer === index;
        return `rounded-lg p-4 text-white font-bold text-lg transition-all ${color.bg} ${color.hover} ${isSelected ? color.selected : ''}`;
    }
</script>

<div class="flex flex-col h-full">
    <div class="mb-4 flex justify-between items-center">
        <span class="text-primary-400 text-sm">{roundData.category}</span>
        <span class="text-gray-400 text-sm">Q{roundData.questionNumber}/{roundData.totalQuestions}</span>
    </div>

    <div class="card mb-6">
        <p class="text-lg font-medium text-center">{roundData.question}</p>
    </div>

    <div class="flex-1 grid grid-cols-2 gap-3">
        {#each roundData.options as option, i}
            <button
                class={getButtonClass(i)}
                on:click={() => selectAnswer(i)}
            >
                <span class="text-2xl">{optionLabels[i]}</span>
                <span class="text-sm text-center">{option}</span>
                {#if selectedAnswer === i}
                    <span class="text-xs mt-1">✓ Selected</span>
                {/if}
            </button>
        {/each}
    </div>
</div>
