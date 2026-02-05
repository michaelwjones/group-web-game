# Blind Artists Implementation Plan

## Overview

Implement the Blind Artists cooperative game as a plugin within the existing group-web-game platform. 12 players with 4 roles (Fine Brush, Thick Brush, Painter, Liaison) work together to paint a hidden target over 5 rounds.

**Decisions made:**
- 12 players only (13-18 TBD later)
- Host arranges seating order in lobby (not player-reported)
- Pigment self-assessment updates in real-time (new `player:action` message type)

---

## Framework Gaps & Extensions (Phase 1)

The existing plugin system needs four small extensions:

| Gap | Change |
|-----|--------|
| Mutable responses | Plugin flag `mutableResponses` — overwrites instead of rejecting |
| Host-controlled rounds | Plugin flag `hostControlledRounds` — no auto-end when all respond |
| Real-time actions | New `player:action` message + plugin `onPlayerAction()` method |
| Host ends active round | `handleHostNextRound` works during `in_progress` (not just `between_rounds`) |

**Files to modify:**

`packages/shared/src/types/plugin.ts`
- Add `mutableResponses?: boolean`
- Add `hostControlledRounds?: boolean`
- Add `onPlayerAction?(playerId, action, session): { hidden, public, playerPrivate? }`

`packages/shared/src/types/messages.ts`
- Add `C2S_PlayerAction { type: 'player:action'; action: unknown }`
- Add to `ClientToServerMessage` union

`packages/server/src/game/game-session.ts`
- `submitResponse()`: if `mutableResponses`, overwrite existing response
- `submitResponse()`: if `hostControlledRounds`, never return `allReceived: true`
- Add `handlePlayerAction(playerId, action)` that delegates to plugin

`packages/server/src/websocket/handler.ts`
- Handle `player:action` message — call `game.handlePlayerAction()`, broadcast state
- `handleHostNextRound()`: when status is `in_progress`, call `endCurrentRound()` then check `isLastRound()`. When status is `between_rounds`, start next round (existing behavior)

---

## Server Plugin (Phases 2-5)

### New files

```
games/blind-artists/
  server/
    package.json
    index.ts          — GamePlugin implementation
    types.ts          — State type definitions
    content.ts        — Elements, target generation, pigment distribution
    feedback.ts       — Liaison feedback engine (Locate/Diagnose/Prescribe/Validate/Freebie)
    clues.ts          — Starting clue generation
```

### State Types (`types.ts`)

```typescript
type Zone = 'back' | 'mid' | 'fore' | 'focus';
type SlotType = 'primary' | 'secondary' | 'highlight' | 'shadow';
type Color = 'red' | 'yellow' | 'blue' | 'orange' | 'green' | 'purple';
type Pigment = 'red' | 'yellow' | 'blue';
type Role = 'fine-brush' | 'thick-brush' | 'painter' | 'liaison';

// Hidden state (server only)
interface BlindArtistsHidden {
  target: Record<Zone, Record<SlotType, Color>>;
  canvas: Record<Zone, Record<SlotType, Color | null>>;
  pigments: Record<string, Pigment>;
  roles: Record<string, Role>;
  seatingOrder: string[];
  elements: Record<Zone, string>;
  pigmentUses: Record<string, number>;
  currentChoices: Record<string, unknown>;
  liaisonKnowledge: Record<string, { zone: Zone; element: string }>;
}

// Public state (visible to all)
interface BlindArtistsPublic {
  canvasOccupied: Record<Zone, Record<SlotType, boolean>>;
  pigmentUsesRemaining: Record<string, number>;
  selfAssessments: Record<string, Pigment | 'unknown'>;
  roles: Record<string, Role>;
  seatingOrder: string[];
  roundNumber: number;
  totalRounds: number;
  submittedPlayers: string[];
  slotClaims: Record<string, { zone: Zone; slot: SlotType } | null>; // painter -> claimed slot
}

// Per-player private state
interface BlindArtistsPlayerPrivate {
  role: Role;
  clue: string;
  liaisonElement?: string;   // Liaisons only: "The Back is Aurora"
  sceneType?: string;        // Liaisons only: "Landscape"
  feedback?: string[];       // Liaison question answers (accumulates)
  freeFeedback?: string[];   // Freebie feedback (accumulates)
}
```

### Content System (`content.ts`)

- Element definitions for each zone with valid Primary/Secondary colors (from design doc)
- `generateTarget()`: random element per zone, random valid colors, random highlight/shadow
- `calculatePigmentDemand(target)`: tally R/Y/B uses from target colors
- `distributePigments(playerIds, demand)`: assign pigments skewed toward higher demand, validate 2x supply
- Retry loop if validation fails

### Game Logic (`index.ts`)

Plugin properties: `id: 'blind-artists'`, `minPlayers: 12`, `maxPlayers: 12`, `defaultRounds: 5`, `mutableResponses: true`, `hostControlledRounds: true`

**`createInitialState(players, config)`**
1. Read seating order from `config.customConfig.seatingOrder`
2. Generate target painting (retry until pigment validation passes)
3. Assign roles: 2 Fine Brush, 2 Thick Brush, 5 Painter, 3 Liaison (random)
4. Distribute pigments
5. Generate one starting clue per player
6. 3 Liaisons learn 3 of 4 zone elements (1 zone left unknown)

**`onRoundStart(roundNumber, session)`**
- Clear current choices and slot claims
- Return round data (round number, canvas occupied state)
- Return per-player private data (role info, for Liaisons: accumulated feedback)

**`validateResponse(playerId, response, session)`**
- Dispatch by role:
  - Fine Brush: valid target player, target has remaining uses
  - Thick Brush: 2 players, adjacent in seating, both have remaining uses
  - Painter: valid brush player, valid zone+slot, slot not claimed by other painter
  - Liaison: valid question category + required sub-choices

**`onResponseReceived(playerId, response, session)`**
- Update hidden.currentChoices
- For painters: update public.slotClaims (release old, claim new)
- Update public.submittedPlayers

**`onAllResponsesReceived(responses, session)`** (triggered by host ending round)
- Resolve each brush's color from selected pigments
- Apply each painter's stroke to canvas (brush color -> zone+slot)
- Update canvas occupied state
- Generate Liaison feedback: answer each Liaison's question + generate freebies
- Update pigmentUses counts
- Update playerPrivate with new feedback
- Return round results summary

**`onPlayerAction(playerId, action, session)`** (for self-assessment)
- Update `publicState.selfAssessments[playerId]`

**`calculateScores`** — cooperative: all players get same score = number of correct slots

**`onGameEnd`** — return target, canvas (with colors), elements, tier result, pigment assignments

### Feedback Engine (`feedback.ts`)

Each function takes canvas + target and returns feedback text:

- `locate(scope: 'zones' | 'slots', canvas, target)` → zone/slot name with most errors
- `diagnose(scope: Zone | SlotType, canvas, target)` → list of incorrect positions
- `prescribe(canvas, target)` → "Color in Zone" or "Color as SlotType"
- `validate(zone, slot, canvas, target)` → yes/no
- `generateFreebie(canvas, target, alreadyGiven)` → defensive or offensive feedback

### Clue Generation (`clues.ts`)

- `generateClue(playerId, pigments, seatingOrder)` → clue text string
- Randomly picks clue type, generates truthful clue, validates it provides useful info
- Types: neighbor, distance, exclusion, color-potential, presence

---

## Client Plugin (Phases 6-9)

### New files

```
games/blind-artists/client/
  PlayerInput.svelte              — Routes to role-specific component
  DisplayBoard.svelte             — Shared screen (TV)
  ResultsDisplay.svelte           — End game reveal
  components/
    FineBrushInput.svelte          — Select 1 player
    ThickBrushInput.svelte         — Select 2 adjacent players
    PainterInput.svelte            — Select brush + zone + slot
    LiaisonInput.svelte            — Question category + sub-choices
    SelfAssessment.svelte          — Pigment self-assessment toggle
    CanvasGrid.svelte              — 4x4 slot grid (reused across views)
    SeatingCircle.svelte           — Circular seating visualization
    SeatingSetup.svelte            — Host lobby UI for arranging seating order
```

### Files to modify

- `packages/client/src/lib/games/registry.ts` — register blind-artists
- `packages/server/src/index.ts` — register server plugin
- `packages/client/src/lib/stores/game.ts` — add `submitAction()` function for `player:action`

### Player Input (`PlayerInput.svelte`)

Reads `privateState.role` and renders the appropriate sub-component. All role components share:
- Self-assessment toggle (SelfAssessment.svelte)
- Canvas grid showing slot occupancy
- Round info header
- "Waiting for host" indicator after submitting

Role-specific UIs call `submitResponse()` with role-typed response objects. Players can resubmit freely to change their choice.

### Display Board (`DisplayBoard.svelte`)

During rounds:
- Canvas grid (4x4, painted/empty indicators)
- Seating circle with player names, roles, pigment uses remaining
- Self-assessments displayed per player
- Submission progress
- Host: "End Round" button

Between rounds:
- Updated canvas grid
- Host: "Next Round" button (or "Reveal Painting" on last round)

### Results Display (`ResultsDisplay.svelte`)

- Tier result banner
- Correct count (X/16)
- Side-by-side canvas vs target with color cells
- Correct slots highlighted green, incorrect red
- Zone element labels
- Pigment assignments revealed

### Seating Setup (`SeatingSetup.svelte`)

Shown in lobby for the host only (Blind Artists game type):
- List of connected players
- Host drags/reorders them into circular seating order
- Visual circle preview
- Order is sent as `customConfig.seatingOrder` when host starts game

---

## Execution Order

1. **Framework extensions** (Phase 1) — unblocks server plugin
2. **Types & content generation** — types.ts, content.ts
3. **Clue generation** — clues.ts
4. **Feedback engine** — feedback.ts
5. **Server plugin** — index.ts (full GamePlugin)
6. **Client setup** — registration, stores, seating setup
7. **Role UIs** — 4 role components + shared components
8. **Display board** — shared screen
9. **End game** — results reveal
10. **Integration & test** — wire everything, test with harness

---

## Verification

- Use test harness with 12 player frames + 1 display frame
- Verify seating setup flow in lobby
- Verify each role's UI shows correct options and allows changing choices
- Verify host can end round and resolution works (brushes resolve, canvas updates)
- Verify Liaison feedback is accurate against canvas/target
- Verify pigment use limits are enforced
- Verify slot exclusivity for painters
- Verify end game reveals correct tier and side-by-side comparison
- Verify self-assessment updates propagate to all players in real-time
