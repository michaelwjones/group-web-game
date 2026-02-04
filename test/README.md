# Test Harness

A fullscreen-capable testing harness that launches multiple game clients in a single browser window, enabling rapid testing and game design iteration.

## Usage

1. Open `harness.html` directly in your browser (double-click or use `file://` URL)
2. Configure:
   - **Game**: Select game type (e.g., Trivia)
   - **Players**: Number of player clients (1-8)
   - **Include Display**: Whether to include a shared display client
3. Click **Start Test**
4. The harness automatically:
   - Creates a game (via display or Player 1)
   - Spawns player iframes that auto-join with names (Player1, Player2, etc.)
5. When status shows "Ready!", the host can click "Start Game" in their iframe
6. Use **Reset** to tear down and start fresh
7. Use **Fullscreen** for a cleaner testing view

## Layout

With Display (display gets ~40% left side):
```
┌─────────────┬──────┬──────┐
│             │  P1  │  P2  │
│   Display   ├──────┼──────┤
│             │  P3  │  P4  │
└─────────────┴──────┴──────┘
```

Without Display (optimal grid):
```
┌──────┬──────┐
│  P1  │  P2  │
├──────┼──────┤
│  P3  │  P4  │
└──────┴──────┘
```

## How It Works

The harness uses iframes pointing to the production client with special URL parameters that trigger automatic actions.

### URL Parameters

| Parameter | Description |
|-----------|-------------|
| `testMode=true` | Enables test mode (hides connection banner, enables postMessage) |
| `testClientId=X` | Unique ID for session isolation (prefixes localStorage keys) |
| `autoCreate=true` | Auto-create a game on page load |
| `gameType=trivia` | Game type to create |
| `asDisplay=true` | Create game as display (no player) |
| `playerName=X` | Player name for create/join |
| `autoJoin=true` | Auto-join game on page load (used on `/play/[code]` route) |

### postMessage Protocol

Iframes communicate with the parent harness via `postMessage`:

```typescript
// From iframe to parent:
{ type: 'GAME_CREATED', code: string }  // Game created, here's the code
{ type: 'JOINED', clientId: string }     // Client joined successfully
{ type: 'ERROR', message: string }       // Something went wrong
```

### Flow

1. Harness creates first iframe:
   - With display: `/?autoCreate=true&gameType=X&asDisplay=true&testMode=true&testClientId=display`
   - Without display: `/?autoCreate=true&gameType=X&playerName=Player1&testMode=true&testClientId=p1`

2. First iframe creates game, posts `GAME_CREATED` with code to parent

3. Harness spawns remaining player iframes:
   - `/play/CODE?autoJoin=true&playerName=PlayerN&testMode=true&testClientId=pN`

4. Each player iframe auto-joins and posts `JOINED` to parent

5. Harness shows "Ready!" when all clients have joined

## Client Changes

The following client files were modified to support test mode:

### `src/lib/stores/test-mode.ts` (new)
- Parses URL parameters for test mode
- Provides `postToParent()` helper for iframe-to-parent communication
- Exports `isTestMode` and `testClientId` stores

### `src/lib/stores/player.ts`
- Session storage key is prefixed with `testClientId` when in test mode
- Prevents conflicts when multiple iframes share localStorage

### `src/routes/+layout.svelte`
- Parses test mode params before game initialization
- Hides `ConnectionStatus` component when in test mode

### `src/routes/+page.svelte`
- Handles `autoCreate` parameter to automatically create games
- Posts `GAME_CREATED` message to parent when game code is received

### `src/routes/play/[gameCode]/+page.svelte`
- Handles `autoJoin` parameter to automatically join games
- Posts `JOINED` message to parent when successfully joined

### `src/routes/display/[gameCode]/+page.svelte`
- Posts `JOINED` message to parent when display connects

## Notes

- All test mode changes are gated behind URL parameters - normal usage is unaffected
- The harness requires the client to be deployed with test mode support
- Session isolation ensures each iframe has its own game session
- The display must be the client that creates the game (by design)
