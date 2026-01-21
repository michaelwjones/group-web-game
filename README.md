# Group Web Game Framework

A reusable web-based multiplayer game framework for in-person group gaming.

## Architecture

- **Common Display** - Shared screen showing game state (TV/projector)
- **Player Devices** - Individual phones/tablets for each participant
- **Host** - One player who controls game flow
- **Server** - Authoritative game state with real-time WebSocket updates

## Tech Stack

- **Runtime**: Node.js 20 LTS
- **Language**: TypeScript
- **Backend**: Fastify + WebSocket
- **Frontend**: SvelteKit + Tailwind CSS
- **Package Manager**: pnpm (monorepo)

## Project Structure

```
group-web-game/
├── packages/
│   ├── shared/     # Shared types and utilities
│   ├── server/     # Fastify WebSocket server
│   └── client/     # SvelteKit frontend
└── games/
    └── trivia/     # Example trivia game plugin
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### Installation

```bash
# Install dependencies
pnpm install

# Build shared types
pnpm --filter @game/shared build
```

### Development

Run the server and client in separate terminals:

```bash
# Terminal 1: Start server
pnpm --filter @game/server dev

# Terminal 2: Start client
pnpm --filter @game/client dev
```

Or run both together:

```bash
pnpm dev
```

### Testing the Game

1. Open browser tab 1 → `http://localhost:5173` → Click "New Game"
2. Open browser tab 2 → Enter join code + name → Join as player
3. Open browser tab 3 → Enter join code + different name → Join as another player
4. First player becomes host automatically
5. Host clicks "Start Game"
6. Answer trivia questions on player devices
7. Watch scores update on the display

## Creating a New Game Plugin

Games implement the `GamePlugin` interface from `@game/shared`:

```typescript
interface GamePlugin {
    id: string;
    name: string;
    minPlayers: number;
    maxPlayers: number;
    defaultRounds: number;

    createInitialState(players, config): InitialState;
    onRoundStart(roundNumber, session): RoundStartData;
    validateResponse(playerId, response, session): ValidationResult;
    onResponseReceived(playerId, response, session): StateUpdate;
    onAllResponsesReceived(responses, session): RoundEndData;
    calculateScores(results, currentScores, session): NewScores;
    onGameEnd(session): FinalResults;
}
```

See `games/trivia/` for a complete example.

## WebSocket Protocol

### Client → Server Messages

| Type | Purpose |
|------|---------|
| `game:create` | Create new game (becomes display) |
| `game:join` | Join with code + name |
| `game:join-display` | Join as display device |
| `session:reconnect` | Reconnect with session token |
| `host:claim` | Claim host role |
| `host:start` | Start the game |
| `host:next-round` | Advance to next round |
| `player:response` | Submit round response |

### Server → Client Messages

| Type | Purpose |
|------|---------|
| `game:created` | Game created with join code |
| `game:joined` | Successfully joined |
| `state:update` | State update |
| `players:update` | Player list changed |
| `round:start` | New round begins |
| `round:end` | Round results |
| `game:end` | Final results |

## Environment Variables

```env
# Server
PORT=3001
HOST=0.0.0.0

# Client
VITE_WS_URL=ws://localhost:3001/ws
```

## Deployment

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Render will auto-detect `render.yaml` and configure the service
4. Note your service URL (e.g., `https://group-web-game-server.onrender.com`)

### Frontend (GitHub Pages)

1. Go to your GitHub repository → Settings → Pages
2. Set Source to "GitHub Actions"
3. Go to Settings → Secrets and variables → Actions → Variables
4. Add a repository variable:
   - Name: `VITE_WS_URL`
   - Value: `wss://your-render-service.onrender.com/ws`
5. Push to `main` branch - the workflow will auto-deploy

### After Deployment

Your game will be available at:
- **Frontend**: `https://your-username.github.io/group-web-game/`
- **Backend**: `https://your-render-service.onrender.com`

**Note**: Render free tier services spin down after inactivity. The first request may take ~30 seconds to wake up.

## License

MIT
