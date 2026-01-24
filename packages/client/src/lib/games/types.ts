import type { ComponentType } from 'svelte';

export interface GameClientPlugin {
    id: string;
    name: string;
    description: string;
    icon?: string;
    minPlayers: number;
    maxPlayers: number;
    components: {
        PlayerInput: ComponentType;
        DisplayBoard: ComponentType;
        ResultsDisplay: ComponentType;
    };
}
