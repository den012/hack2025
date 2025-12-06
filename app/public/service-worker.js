const CACHE_NAME = 'bunker-map-cache-v2';
const API_URL_BASE = 'https://2bd3558eafcb.ngrok-free.app/api/getBunkers';
const MAP_TILE_HOST = 'tile.openstreetmap.org';

// IMPORTANT: After you run `npm run build`, you need to come back here
// and add the generated JS and CSS file paths to this list.
// e.g., '/assets/index-a1b2c3d4.js', '/assets/index-e5f6g7h8.css'
const APP_SHELL_URLS = [
    '/',
    '/index.html',
    '/assets/index-CDVKvM6r.js',
    '/assets/index-Dc6UIqLD.css',
    '/index.html'
    // Add your built asset files here
];

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


// network requests
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Strategy 1: Map Tiles (Cache First, then Network)
    if (requestUrl.hostname === MAP_TILE_HOST) {
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

    // Strategy 2: API Data (Network First, then Cache)
    if (requestUrl.pathname.startsWith(API_URL_BASE)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // If we get a valid response, clone it and cache it
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If the network fails, try to get it from the cache
                    console.log('Network failed, serving API from cache for:', event.request.url);
                    return caches.match(event.request);
                })
        );
        return;
    }

    // Strategy 3: App Shell & Other Assets (Cache First)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});