<script lang="ts">
    export let roundData: {
        question: string;
        options: string[];
        category: string;
        questionNumber: number;
        totalQuestions: number;
    };
    export let publicState: {
        answeredCount: number;
        totalPlayers: number;
    } | null = null;

    const optionLabels = ['A', 'B', 'C', 'D'];
</script>

<div class="card">
    <div class="flex justify-between items-center mb-6">
        <span class="text-primary-400 font-medium">{roundData.category}</span>
        <span class="text-gray-400">
            Question {roundData.questionNumber} of {roundData.totalQuestions}
        </span>
    </div>

    <h2 class="text-2xl lg:text-3xl font-bold mb-8 text-center">
        {roundData.question}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each roundData.options as option, i}
            <div class="bg-gray-700 rounded-lg p-4 flex items-center gap-4">
                <span
                    class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-lg"
                >
                    {optionLabels[i]}
                </span>
                <span class="text-lg">{option}</span>
            </div>
        {/each}
    </div>

    {#if publicState}
        <div class="mt-8 text-center text-gray-400">
            {publicState.answeredCount} of {publicState.totalPlayers} players answered
        </div>
    {/if}
</div>
