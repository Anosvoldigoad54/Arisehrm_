import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend/src'),
    },
  },
  root: './frontend',  // Set frontend as the root directory
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
    host: 'localhost',
    strictPort: false,
    force: true, // Force dependency re-optimization
    hmr: {
      host: 'localhost',
      port: 3000,
      protocol: 'ws',
      clientPort: 3000
    },
    // Add WebSocket proxy to handle connection issues
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      }
    }
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