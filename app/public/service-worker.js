import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// --- 1. Core Workbox Setup ---
// Cleans up old caches from previous versions of the service worker.
cleanupOutdatedCaches()

// This is the placeholder that vite-plugin-pwa will fill with the list of all your app's files.
// This handles caching your entire app shell automatically.
precacheAndRoute(self.__WB_MANIFEST)

// --- 2. Define Constants ---
const API_HOST = '2bd3558eafcb.ngrok-free.app';
const MAP_TILE_DOMAIN = 'tile.openstreetmap.org';

// --- 3. Runtime Caching Strategies ---

// Strategy for Map Tiles: Cache First
// Serve from cache immediately, fall back to network.
registerRoute(
  ({ request, url }) => request.destination === 'image' && url.hostname.endsWith(MAP_TILE_DOMAIN),
  new CacheFirst({
    cacheName: 'map-tiles-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache successful responses and opaque responses (for CORS images)
      }),
    ],
  })
);

// Strategy for API Data: Network First
// Try the network first to get the latest data, fall back to cache if offline.
registerRoute(
  ({ url }) => url.hostname === API_HOST,
  new StaleWhileRevalidate({
    cacheName: 'api-data-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200], // Only cache successful responses
      }),
    ],
  })
);

// By not defining a route for 'router.project-osrm.org' or 'vercel.live',
// we are implicitly telling the service worker to ignore them.
// The browser will handle these requests normally.