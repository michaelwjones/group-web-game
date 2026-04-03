import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173
	},
	resolve: {
		alias: {
			'@game/trivia': path.resolve(__dirname, '../../games/trivia')
		}
	}
});
