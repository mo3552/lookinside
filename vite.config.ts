import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

export default defineConfig({
	plugins: [
		vue(),
		electron([
			{
				entry: 'electron/main.ts',
				onstart(options) {
					options.startup();
				},
				vite: {
					build: {
						outDir: 'dist-electron',
					},
				},
			},
			{
				entry: 'electron/preload.ts',
				onstart(options) {
					options.reload();
				},
				vite: {
					build: {
						outDir: 'dist-electron',
					},
				},
			},
		]),
		renderer(),
	],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	build: {
		outDir: 'dist',
	},
});
