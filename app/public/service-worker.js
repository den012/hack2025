import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// --- 1. Core Workbox Setup ---
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// --- 2. Define Constants ---
const API_HOST = '2bd3558eafcb.ngrok-free.app';
const MAP_TILE_DOMAIN = 'tile.openstreetmap.org';

// --- 3. Ignore Unnecessary External Requests ---
// This tells the service worker to NOT handle requests for these domains.
// The browser will handle them normally (and they will fail offline, which is fine).
registerRoute(
  ({ url }) => url.hostname !== self.location.hostname && url.hostname !== API_HOST && !url.hostname.endsWith(MAP_TILE_DOMAIN),
  () => { /* Do nothing, let the request pass through */ }
);

// --- 4. Runtime Caching Strategies ---

// Strategy for Map Tiles: Cache First
registerRoute(
  ({ request, url }) => request.destination === 'image' && url.hostname.endsWith(MAP_TILE_DOMAIN),
  new CacheFirst({
    cacheName: 'map-tiles-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Strategy for API Data: Stale-While-Revalidate
registerRoute(
  ({ url }) => url.hostname === API_HOST,
  new StaleWhileRevalidate({
    cacheName: 'api-data-cache',
    matchOptions: {
        ignoreSearch: true,
    },
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// --- 5. Global Catch Handler ---
// This is a safety net. If any fetch fails (e.g., API on first offline load),
// this will prevent the service worker from crashing. It allows the network
// error to propagate to your app, where you already handle it.
setCatchHandler(({ event }) => {
    if(event.request.destination === 'document') {
        return caches.match('/');
    }
  // The event handler must return a Response or a Promise that resolves to a Response.
  // We are returning the error response that the browser would have generated.
  return Response.error();
});