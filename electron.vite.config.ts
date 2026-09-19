import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'electron-vite';

function devCspPlugin(): Plugin {
  return {
    name: 'arima:dev-csp',
    apply: 'serve',
    transformIndexHtml(html: string): string {
      return html
        .replace(
          /content="default-src 'self'; script-src 'self';/i,
          "content=\"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';",
        )
        .replace(/connect-src 'self';/i, "connect-src 'self' ws: http:;");
    },
  };
}

export default defineConfig({
  main: {
    build: {
      externalizeDeps: true,
    },
    resolve: {
      alias: {
        '@main': resolve('src/main'),
        '@shared': resolve('src/shared'),
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: false,
    },
    resolve: {
      alias: {
        '@preload': resolve('src/preload'),
        '@shared': resolve('src/shared'),
      },
    },
  },
  renderer: {
    root: resolve('src/renderer'),
    plugins: [react(), tailwindcss(), devCspPlugin()],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('src/shared'),
      },
    },
  },
});
