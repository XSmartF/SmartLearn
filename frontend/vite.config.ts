import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { UserConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
const plugins = [
  react(),
  tailwindcss(),
  visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true, template: 'treemap', emitFile: true })
]

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    chunkSizeWarningLimit: 2000
  },
  server: {
    headers: {
      // Allow popups opened by the app to communicate with the opener (needed for Firebase popup flows)
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      // We don't enable COEP here; keep unsafe-none unless you need cross-origin embedder isolation
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    css: true,
    coverage: {
      reporter: ['text', 'html']
    }
  }
} as unknown as UserConfig)