# Blind Artists - Implementation Plan

## Game Overview

**Blind Artists** is a cooperative game for 12-20 players where everyone is "blind" and trying to paint a picture together. Players have hidden pigments (red, yellow, blue) that no one knows—not even themselves. Through deduction, clues, and coordination, they must paint the correct strokes to match a hidden target.

---

## Core Mechanics Summary

### Pigments & Colors
- **Player Pigments**: Red, Yellow, Blue (hidden from everyone, including self)
- **Stroke Colors** (7 total):
  - Primaries: Red, Yellow, Blue
  - Secondaries: Purple (R+B), Green (Y+B), Orange (R+Y)
  - Tertiary: Black (R+Y+B)

### Canvas Structure
- **Zones**: Player count ÷ 4 (rounded up)
  - 12 players → 3 zones
  - 16 players → 4 zones
  - 20 players → 5 zones
- **Strokes per zone**: Varies (part of target puzzle, e.g., zone 1 needs 2 strokes, zone 2 needs 1)

### Round Structure
- **Rounds**: Fixed 5 rounds
- **Actions**: Simultaneous selection, 1 action per player per round
- **Each action = 1 stroke** targeting a zone

### Brushes (Core Tools)
Each player has a brush that determines how many players they select for their stroke:

| Brush | Selects | Description |
|-------|---------|-------------|
| Fine | 1 player | Precise single-player selection |
| Medium | 2 adjacent | Select two players sitting next to each other |
| Broad | 3 adjacent | Wide selection of three adjacent players |

Note: Self-inclusion is determined by constraints, not brush type.

### Constraints (Permanent Restrictions)
One per player for the entire game:

| Constraint | Restriction |
|------------|-------------|
| Left | Must select only from players to your left |
| Right | Must select only from players to your right |
| Neighbors | Must select only from players adjacent to you |
| Self | Must include yourself as one of your selections (counts toward brush limit) |

Examples with Self constraint:
- Fine + Self = Just your pigment (you're your only selection)
- Medium + Self = You + 1 adjacent player = 2 pigments
- Broad + Self = You + 2 adjacent players = 3 pigments

### Information Flow
- **Canvas visibility**: Hidden—players only learn through clues
- **Round 1 clues**: Pigment hints (e.g., "Player X is NOT blue", "Two reds are adjacent")
- **Round 2+ clues**: Decision feedback (e.g., "Your stroke needed more blue", "Zone 2 has too many strokes")
- **Perfect strokes**: Exact pigment match required; revealed permanently when achieved

### Win Condition
- **All required strokes must be perfect** (binary win/lose)
- Target is progressively revealed as strokes are perfected

### Client Role (Game Element)
- The "client" is a thematic game element, not a player
- Server generates hints each round based on how the canvas compares to target
- Hints appear on the shared display for someone to read aloud (e.g., "The client says: the top feels too cold...")
- The target painting remains hidden from all players

---

## Implementation Plan

### Files to Create

#### Server-Side (`games/blind-artists/server/`)

**`index.ts`** - Main game plugin implementing `GamePlugin` interface
- `createInitialState()`: Generate target painting, assign pigments/brushes/constraints, create initial clues
- `onRoundStart()`: Distribute clues (pigment hints round 1, decision feedback round 2+)
- `validateResponse()`: Validate player action (zone selection, player targets)
- `onResponseReceived()`: Track submitted actions
- `onAllResponsesReceived()`: Resolve all strokes, determine results, generate feedback clues
- `calculateScores()`: Check for perfect strokes, update revealed target

**`types.ts`** - Game-specific types
- `Pigment`, `StrokeColor`, `BrushType`, `ConstraintType`
- `TargetPainting`, `Stroke`, `Zone`, `PlayerAction`
- Hidden/Public/Private state interfaces

**`target-generator.ts`** - Target painting generation
- Generate zone requirements based on player count
- Assign stroke color requirements per zone
- Ensure target is achievable given pigment distribution

**`clue-generator.ts`** - Clue generation logic
- Round 1: Pigment-related clues
- Round 2+: Decision/result feedback clues

**`color-mixer.ts`** - Color combination logic
- Combine pigments to produce stroke colors (R+B=Purple, etc.)
- Determine resulting color from player selections

#### Client-Side (`games/blind-artists/client/`)

**`PlayerInput.svelte`** - Player action input
- Zone selection (dropdown/buttons)
- Player selection for brush (based on brush type and constraint)
- Visual indicator of brush type and constraint
- Seating arrangement visualization

**`DisplayBoard.svelte`** - Shared display during rounds
- Abstract canvas visualization (zones, not actual colors since hidden)
- Player list with seating order
- Round counter, action submission status
- Current revealed perfect strokes

**`ResultsDisplay.svelte`** - Round results display
- Newly revealed perfect strokes (if any)
- Client hint suggestions (for client to read)
- Private clue distribution indicator

**`ClientHints.svelte`** - Component for displaying the "client's" feedback
- Server-generated hints displayed on shared screen
- Thematic framing ("The client says...")
- Integrated into DisplayBoard between rounds

### Files to Modify

**`packages/server/src/index.ts`**
- Import and register `blindArtistsPlugin`

**`packages/client/src/lib/games/registry.ts`**
- Add Blind Artists components to registry

**`packages/shared/src/types/games.ts`** (if exists, or create)
- Add `'blind-artists'` to game type union

### State Structure

```typescript
// Hidden State (server only)
interface BlindArtistsHidden {
  target: TargetPainting;           // Full target requirements
  playerPigments: Map<string, Pigment>;  // Each player's hidden pigment
  canvas: Map<ZoneId, Stroke[]>;    // Current painted strokes
  perfectStrokes: PerfectStroke[];  // Revealed perfect strokes
  pendingClues: Map<string, Clue[]>; // Clues to distribute
}

// Public State (visible to all)
interface BlindArtistsPublic {
  zones: number;                    // Number of zones
  revealedStrokes: RevealedStroke[]; // Perfect strokes (visible to all)
  strokesSubmitted: number;         // How many actions received this round
  round: number;
}

// Player Private State (per-player)
interface BlindArtistsPrivate {
  brush: BrushType;
  constraint: ConstraintType;
  seatPosition: number;            // For adjacency calculations
  clues: Clue[];                   // This player's received clues
}
```

### Player Action Format

```typescript
interface PlayerAction {
  zone: number;                    // Which zone to paint
  selectedPlayers: string[];       // Player IDs whose pigments to use
}
```

---

## Implementation Order

1. **Shared types** - Define all game types in `games/blind-artists/server/types.ts`
2. **Color mixer** - Implement pigment combination logic
3. **Target generator** - Create target painting generation
4. **Clue generator** - Implement clue generation for both phases
5. **Server plugin** - Main game logic with all hooks
6. **Player input UI** - Zone and player selection interface
7. **Display board UI** - Shared display for rounds
8. **Results display UI** - Round results visualization
9. **Client hints UI** - Hint display component
10. **Registration** - Register game in server and client

---

## Verification Plan

### Manual Testing
1. Start server and client: `pnpm dev`
2. Create a Blind Artists game
3. Join with 12+ players (can use multiple browser tabs/windows)
4. Open shared display view (shows client hints between rounds)
5. Play through 5 rounds:
   - Verify pigment assignment is hidden
   - Verify brushes/constraints are correctly assigned and visible to player
   - Verify clue distribution (round 1 vs round 2+)
   - Verify stroke resolution and color mixing
   - Verify perfect stroke detection and reveal
   - Verify "client" hints appear on display between rounds
6. Test win condition (all perfect strokes)
7. Test with different player counts (12, 16, 20)

### Edge Cases to Test
- Player disconnection/reconnection mid-game
- Constraint violations (selecting invalid players)
- Zone overflow (more strokes than needed)
- Adjacency edge cases (wrap-around seating?)

---

## Open Questions for Future Iterations

1. **Balance**: Are 5 rounds enough to deduce and paint correctly?
2. **Difficulty scaling**: Should target complexity scale with player count?
3. **Clue variety**: Expand clue types based on playtesting
4. **Tool balance**: Adjust brushes/constraints after testing
5. **Hint quality**: How specific/cryptic should the server-generated hints be?
6. **Modifiers**: Consider adding specialty effects in future versions if more complexity desired
