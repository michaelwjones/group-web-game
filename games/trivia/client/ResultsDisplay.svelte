<script lang="ts">
    import type { RoundResults } from '@game/shared';

    export let results: RoundResults<{
        question: string;
        options: string[];
        correctIndex: number;
        playerAnswers: Record<string, { answer: number; correct: boolean; points: number }>;
    }>;

    $: triviaResults = results.results;
    const optionLabels = ['A', 'B', 'C', 'D'];

    $: correctCount = Object.values(triviaResults.playerAnswers).filter((a) => a.correct).length;
    $: totalAnswers = Object.values(triviaResults.playerAnswers).length;
</script>

<div class="card">
    <h3 class="text-xl font-semibold mb-4">Question</h3>
    <p class="text-lg mb-6">{triviaResults.question}</p>

    <div class="space-y-2 mb-6">
        {#each triviaResults.options as option, i}
            <div
                class="rounded-lg p-3 flex items-center gap-3"
                class:bg-green-700={i === triviaResults.correctIndex}
                class:bg-gray-700={i !== triviaResults.correctIndex}
            >
                <span class="font-bold">{optionLabels[i]}.</span>
                <span>{option}</span>
                {#if i === triviaResults.correctIndex}
                    <span class="ml-auto text-green-300">Correct</span>
                {/if}
            </div>
        {/each}
    </div>

    <div class="text-center text-gray-400">
        {correctCount} of {totalAnswers} players answered correctly
    </div>
</div>
