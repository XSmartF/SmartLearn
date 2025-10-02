import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true, template: 'treemap', emitFile: true })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Allow dynamic imports to be chunked automatically
          if (id.includes('/src/') && !id.includes('node_modules')) {
            // Don't manually chunk dynamic imports, let Vite handle them
            return;
          }

          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react';
            }
            
            // UI libraries - split Radix UI into smaller chunks
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-popover') || 
                id.includes('@radix-ui/react-dropdown-menu')) {
              return 'radix-overlays';
            }
            if (id.includes('@radix-ui')) return 'radix-ui';
            if (id.includes('lucide-react')) return 'icons';
            
            // Chart libraries
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            
            // Firebase - keep together to avoid initialization issues
            if (id.includes('firebase') || id.includes('@firebase')) return 'firebase';
            
            // Redux
            if (id.includes('redux') || id.includes('@reduxjs')) return 'redux';
            
            // Editor/Rich text
            if (id.includes('slate') || id.includes('lexical')) {
              return 'editor';
            }
            // Keep prosemirror packages with the rest of the vendor stack to avoid circular chunks
            if (id.includes('prosemirror')) {
              return 'vendor';
            }
            
            // Other large libraries
            if (id.includes('framer-motion')) return 'animations';
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) return 'date-utils';
            
            // Vendor chunk for remaining node_modules
            return 'vendor';
          }
          
          // Custom large modules
          if (id.includes('/lib/learnEngine')) return 'learn-engine';
        }
      }
    },
    chunkSizeWarningLimit: 2000
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  }
})