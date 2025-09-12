import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      'framer-motion',
      'recharts',
      'chart.js',
      'chartjs-adapter-dayjs-4', 
      'react-chartjs-2'
    ]
  },
  server: {
    port: 3000,
    host: true, // Changed from 'localhost' to true to allow external connections
    strictPort: false,
    force: true, // Force dependency re-optimization
    hmr: {
      // Removed explicit HMR configuration to use Vite defaults
      // This often resolves WebSocket connection issues
    },
    // Removed WebSocket proxy as it was causing conflicts
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/system'],
          charts: ['recharts'],
        }
      }
    }
  }
})