const CACHE_NAME = 'dilo-v4';
const STATIC_ASSETS = [
    '/',
    '/devocionales',
    '/series',
    '/estudios',
    '/offline',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json',
];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ── Activate ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key))
                )
            )
            .then(() => self.clients.claim())
    );
});

// ── Fetch ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Ignorar — HMR, websockets, API interna
    if (
        url.pathname.startsWith('/__vite') ||
        url.pathname.startsWith('/hot') ||
        url.pathname.startsWith('/api/push') ||
        url.pathname.startsWith('/sanctum') ||
        url.protocol === 'chrome-extension:'
    ) return;

    // Assets estáticos — cache first
    const esAsset =
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/assets/') ||
        url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|woff|woff2|ttf|css|js)$/);

    if (esAsset) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;

                return fetch(event.request).then((response) => {
                    if (!response || response.status !== 200) return response;
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    // Páginas HTML — network first, fallback a cache, fallback a /offline
    if (event.request.destination === 'document' || event.request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (!response || response.status !== 200) return response;
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() =>
                    caches.match(event.request)
                        .then((cached) => cached || caches.match('/offline'))
                )
        );
        return;
    }
});

// ── Push ──────────────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    event.waitUntil(
        self.registration.showNotification(data.title ?? 'Nueva publicación', {
            body:    data.body  ?? '',
            icon:    data.icon  ?? '/icon-192.png',
            badge:   '/icon-192.png',
            data:    data.data  ?? {},
            actions: [{ action: 'open', title: 'Ver ahora' }],
            vibrate: [200, 100, 200],
        })
    );
});

// ── Notification click ────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(url) && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});