import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg']  // sometimes helps
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        video: 'video.html',
        changelog: 'changelog.html'
      },
      output: {
        manualChunks: {
          // prevent ffmpeg from being chunked separately (optional)
        }
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    },
    fs: {
      allow: ['.'] // Allow serving files from project root and node_modules
    }
  }
});
