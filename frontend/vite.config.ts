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
    host: '0.0.0.0', // Listen on all network interfaces
    strictPort: false,
    force: true, // Force dependency re-optimization
    hmr: {
      // Removed explicit HMR configuration to use Vite defaults
      // This often resolves WebSocket connection issues
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.preview.emergentagent.com', // Allow all preview subdomains
      'fixall-explorer.preview.emergentagent.com'
    ],
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