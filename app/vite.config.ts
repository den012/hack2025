import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/greet': process.env.VITE_API_URL || 'http://localhost:8080'
    }
  },
  plugins: [
    react(), 
    tailwindcss(),
      VitePWA({
      // Use your existing service worker
      srcDir: 'src',
      filename: 'service-worker.js',
      strategies: 'injectManifest',
      
      // We don't need to define the manifest here because 
      // injectManifest will use your existing service worker logic.
      // The plugin will automatically find and inject the list of assets to cache.
      injectManifest: {
        // This tells the plugin where to find the assets to add to the precache list.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
})
