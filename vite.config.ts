import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  esbuild: {
    legalComments: 'none',
    drop: ['debugger'],
  },
  build: {
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: {
      // Every target browser already understands <link rel="modulepreload">.
      polyfill: false,
    },
    rollupOptions: {
      output: {
        /**
         * Only the eagerly-loaded libraries are bucketed into stable vendor
         * chunks. Anything else (html-to-image, jspdf and their deps) returns
         * `undefined`, which keeps it attached to the dynamic import that
         * loads it — so the export code never weighs down first paint.
         */
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (/node_modules[/\\](react-dom|scheduler|react)[/\\]/.test(id)) return 'react';
          if (/node_modules[/\\]lucide-react[/\\]/.test(id)) return 'icons';
          if (/node_modules[/\\]canvas-confetti[/\\]/.test(id)) return 'confetti';
          return undefined;
        },
      },
    },
  },
});
