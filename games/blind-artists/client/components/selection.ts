/** Shared selection-state visual feedback for blind-artists UI components. */

export type SelectionState = 'none' | 'pending' | 'confirmed';

export function selectionState(selected: boolean, confirmed: boolean): SelectionState {
    if (confirmed) return 'confirmed';
    if (selected) return 'pending';
    return 'none';
}

/** Ring classes for circular player buttons (SeatingCircle). */
export function circleRingClass(state: SelectionState): string {
    switch (state) {
        case 'confirmed': return 'ring-4 ring-green-400 scale-110';
        case 'pending': return 'ring-4 ring-amber-400 scale-110';
        default: return '';
    }
}

/** Border+ring classes for grid cells (CanvasGrid slots). */
export function gridCellClass(state: SelectionState): string {
    switch (state) {
        case 'confirmed': return 'border-green-400 ring-2 ring-green-400';
        case 'pending': return 'border-amber-400 ring-2 ring-amber-400';
        default: return '';
    }
}

/** Border+bg classes for toggle buttons (brush selection, liaison categories). */
export function buttonClass(state: SelectionState): string {
    switch (state) {
        case 'confirmed': return 'border-green-400 bg-green-900';
        case 'pending': return 'border-amber-400 bg-amber-900';
        default: return 'border-gray-600 bg-gray-800 hover:border-gray-400';
    }
}

/** Text color for status messages. */
export function statusTextClass(state: SelectionState): string {
    switch (state) {
        case 'confirmed': return 'text-green-400';
        case 'pending': return 'text-amber-400';
        default: return 'text-gray-500';
    }
}
