import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg']  // sometimes helps
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // prevent ffmpeg from being chunked separately (optional)
        }
      }
    }
  },
  server: {
    fs: {
      allow: ['.'] // Allow serving files from project root and node_modules
    }
  }
});
