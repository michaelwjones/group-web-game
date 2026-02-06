<script lang="ts">
    import { submitResponse } from '$lib/stores/game';
    import SelfAssessment from './SelfAssessment.svelte';

    type Zone = 'back' | 'mid' | 'fore' | 'focus';
    type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
    type Pigment = 'red' | 'yellow' | 'blue';

    export let selfId: string;
    export let selfAssessments: Record<string, Pigment | 'unknown'>;
    export let liaisonElements: { zone: Zone; element: string }[] = [];
    export let sceneType: string = 'Landscape';
    export let feedback: string[] = [];
    export let freeFeedback: string[] = [];

    type Category = 'locate' | 'diagnose' | 'prescribe' | 'validate';

    let selectedCategory: Category | null = null;
    let selectedChoice: string | { zone: Zone; slot: SlotType } | null = null;
    let submitted = false;

    const zones: Zone[] = ['back', 'mid', 'fore', 'focus'];
    const slotTypes: SlotType[] = ['primary', 'secondary', 'highlight', 'shadow'];

    const categoryDescriptions: Record<Category, string> = {
        locate: 'Find the worst zone or slot type',
        diagnose: 'Check what\'s wrong in a zone/slot type',
        prescribe: 'Get a color recommendation',
        validate: 'Check if a specific slot is correct'
    };

    function selectCategory(cat: Category) {
        selectedCategory = cat;
        selectedChoice = null;
        submitted = false;

        // Prescribe doesn't need a choice
        if (cat === 'prescribe') {
            submitQuestion();
        }
    }

    function selectChoice(choice: string | { zone: Zone; slot: SlotType }) {
        selectedChoice = choice;
        submitQuestion();
    }

    function submitQuestion() {
        if (!selectedCategory) return;

        submitted = true;
        submitResponse({
            type: 'liaison',
            category: selectedCategory,
            choice: selectedChoice ?? undefined
        });
    }

    function capitalize(s: string): string {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
</script>

<div class="liaison-input p-4 overflow-y-auto max-h-[80vh]">
    <div class="text-center mb-4">
        <h3 class="text-lg font-bold text-yellow-400">📡 Liaison</h3>
        <p class="text-sm text-gray-400">Ask the client a question</p>
    </div>

    <!-- Known elements -->
    <div class="mb-4 p-3 bg-gray-800 rounded-lg">
        <p class="text-xs text-gray-400 mb-1">Scene: {sceneType}</p>
        <p class="text-xs text-gray-400">You know:</p>
        <ul class="text-sm">
            {#each liaisonElements as elem}
                <li class="text-yellow-300">{capitalize(elem.zone)}: {elem.element}</li>
            {/each}
        </ul>
    </div>

    <!-- Previous feedback -->
    {#if feedback.length > 0 || freeFeedback.length > 0}
        <div class="mb-4 p-3 bg-gray-800 rounded-lg max-h-32 overflow-y-auto">
            <p class="text-xs text-gray-400 mb-1">Previous feedback:</p>
            {#each feedback as fb, i}
                <p class="text-sm text-green-300">Q{i + 1}: {fb}</p>
            {/each}
            {#each freeFeedback as fb, i}
                <p class="text-sm text-blue-300 italic">Hint: {fb}</p>
            {/each}
        </div>
    {/if}

    <!-- Category selection -->
    {#if !selectedCategory}
        <div class="space-y-2">
            {#each ['locate', 'diagnose', 'prescribe', 'validate'] as cat}
                <button
                    class="w-full p-3 rounded-lg border-2 border-gray-600 bg-gray-800
                        hover:border-yellow-400 transition-all text-left"
                    on:click={() => selectCategory(cat as Category)}
                >
                    <span class="font-bold text-yellow-400">{capitalize(cat)}</span>
                    <p class="text-xs text-gray-400">{categoryDescriptions[cat as Category]}</p>
                </button>
            {/each}
        </div>
    {:else if selectedCategory === 'locate' && !submitted}
        <div class="space-y-2">
            <p class="text-sm text-gray-400 mb-2">Ask about zones or slot types?</p>
            <button
                class="w-full p-3 rounded-lg border-2 border-gray-600 bg-gray-800
                    hover:border-yellow-400"
                on:click={() => selectChoice('zones')}
            >
                Zones (Back/Mid/Fore/Focus)
            </button>
            <button
                class="w-full p-3 rounded-lg border-2 border-gray-600 bg-gray-800
                    hover:border-yellow-400"
                on:click={() => selectChoice('slots')}
            >
                Slot Types (Primary/Secondary/etc.)
            </button>
        </div>
    {:else if selectedCategory === 'diagnose' && !submitted}
        <div class="space-y-2">
            <p class="text-sm text-gray-400 mb-2">Choose a zone or slot type to diagnose:</p>
            <div class="grid grid-cols-2 gap-2">
                {#each zones as zone}
                    <button
                        class="p-2 rounded-lg border-2 border-gray-600 bg-gray-800
                            hover:border-yellow-400 text-sm"
                        on:click={() => selectChoice(zone)}
                    >
                        {capitalize(zone)}
                    </button>
                {/each}
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
                {#each slotTypes as slot}
                    <button
                        class="p-2 rounded-lg border-2 border-gray-600 bg-gray-800
                            hover:border-yellow-400 text-sm"
                        on:click={() => selectChoice(slot)}
                    >
                        {capitalize(slot)}
                    </button>
                {/each}
            </div>
        </div>
    {:else if selectedCategory === 'validate' && !submitted}
        <div class="space-y-2">
            <p class="text-sm text-gray-400 mb-2">Select a slot to validate:</p>
            {#each zones as zone}
                <div class="flex gap-1">
                    <span class="w-12 text-xs text-gray-400">{capitalize(zone)}</span>
                    {#each slotTypes as slot}
                        <button
                            class="flex-1 p-1 rounded border border-gray-600 bg-gray-800
                                hover:border-yellow-400 text-xs"
                            on:click={() => selectChoice({ zone, slot })}
                        >
                            {capitalize(slot).slice(0, 3)}
                        </button>
                    {/each}
                </div>
            {/each}
        </div>
    {:else if submitted}
        <div class="text-center text-yellow-400 p-4">
            ✓ Question submitted - waiting for round to end
        </div>
        <button
            class="w-full p-2 rounded-lg border border-gray-600 text-gray-400 text-sm
                hover:border-gray-400"
            on:click={() => { selectedCategory = null; selectedChoice = null; submitted = false; }}
        >
            Change question
        </button>
    {/if}

    <div class="mt-4 flex justify-center">
        <SelfAssessment currentAssessment={selfAssessments[selfId] || 'unknown'} />
    </div>
</div>
