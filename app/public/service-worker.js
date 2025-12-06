const CACHE_NAME = 'bunker-map-cache-v5'; // <-- Incremented cache version
const API_HOST = '2bd3558eafcb.ngrok-free.app';
const MAP_TILE_DOMAIN = 'tile.openstreetmap.org';
const ROUTING_HOST = 'router.project-osrm.org';

const APP_SHELL_URLS = [
    '/',
    '/index.html',
    // IMPORTANT: You may need to update these filenames after your next build
    '/assets/index-CDVKvM6r.js',
    '/assets/index-Dc6UIqLD.css'
];

// ... (install and activate events are the same) ...
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching App Shell');
                return cache.addAll(APP_SHELL_URLS);
            })
            .catch(error => {
                console.error('Failed to cache app shell:', error);
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    if (requestUrl.hostname === ROUTING_HOST) {
        return;
    }

    if (requestUrl.hostname.endsWith(MAP_TILE_DOMAIN)) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    if (requestUrl.hostname === API_HOST) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    console.log('Network failed, serving API from cache for:', event.request.url);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // --- FIX: Strategy 3: App Shell & Other Assets (with SPA fallback) ---
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // If a match is found in the cache, return it.
                if (response) {
                    return response;
                }
                // For failed navigation requests, serve index.html as a fallback.
                if (event.request.mode === 'navigate') {
                    console.log('Serving index.html for navigation request:', event.request.url);
                    return caches.match('/index.html');
                }
                // For other failed requests (e.g., images), try to fetch from the network.
                return fetch(event.request);
            })
    );
});