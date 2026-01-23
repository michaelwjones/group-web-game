import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { handleConnection } from './websocket/handler.js';
import { gameManager } from './game/game-manager.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const HOST = process.env.HOST ?? '0.0.0.0';

async function start() {
    const fastify = Fastify({
        logger: true
    });

    // Register plugins
    await fastify.register(cors, {
        origin: true,
        credentials: true
    });

    await fastify.register(websocket);

    // Health check endpoint
    fastify.get('/health', async () => {
        return {
            status: 'ok',
            games: gameManager.getActiveGameCount(),
            plugins: gameManager.getAvailablePlugins().map(p => p.id)
        };
    });

    // WebSocket endpoint
    fastify.get('/ws', { websocket: true }, (socket) => {
        handleConnection(socket);
    });

    // Register game plugins
    const { triviaPlugin } = await import('@game/trivia/server');
    gameManager.registerPlugin(triviaPlugin);

    // Cleanup stale games periodically
    setInterval(() => {
        gameManager.cleanupStaleGames();
    }, 5 * 60 * 1000); // Every 5 minutes

    // Start server
    try {
        await fastify.listen({ port: PORT, host: HOST });
        console.log(`Server running at http://${HOST}:${PORT}`);
        console.log(`WebSocket endpoint: ws://${HOST}:${PORT}/ws`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
