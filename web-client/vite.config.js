import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  resolve: {
    preserveSymlinks: true,
  },
  server: {
    host: '0.0.0.0', // Permet l'accès depuis n'importe quelle adresse IP (y compris mobile)
    port: 5173,
    fs: {
      strict: false,
    },
  },
}))
