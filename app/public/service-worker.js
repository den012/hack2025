const CACHE_NAME = 'bunker-map-cache-v3'; // <-- Incremented cache version
const API_URL_BASE = 'https://2bd3558eafcb.ngrok-free.app/api/getBunkers';
const MAP_TILE_DOMAIN = 'tile.openstreetmap.org'; // <-- Renamed for clarity

const APP_SHELL_URLS = [
    '/',
    '/index.html',
    // IMPORTANT: You may need to update these filenames after your next build
    '/assets/index-CDVKvM6r.js',
    '/assets/index-Dc6UIqLD.css'
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

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Strategy 1: Map Tiles (Cache First, then Network)
    // FIX: Check if hostname ENDS WITH the map tile domain
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

    // Strategy 2: API Data (Network First, then Cache)
    // FIX: Check the full URL with requestUrl.href
    if (requestUrl.href.startsWith(API_URL_BASE)) {
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

    // Strategy 3: App Shell & Other Assets (Cache First)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});